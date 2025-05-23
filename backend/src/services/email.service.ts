import nodemailer, { Transporter } from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: any;
  cc?: string;
  bcc?: string;
}

interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export class EmailService {
  private transporter!: Transporter;
  private templatesPath: string;

  constructor() {
    this.templatesPath = path.join(__dirname, '../templates/email');
    this.initializeTransporter();
  }

  /**
   * メールトランスポーターの初期化
   */
  private initializeTransporter(): void {
    // 環境変数からメール設定を読み込み
    const config: MailConfig = {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    // SendGrid使用の場合
    if (process.env.SENDGRID_API_KEY) {
      this.transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      });
    } else {
      // SMTP設定使用
      this.transporter = nodemailer.createTransport(config);
    }
  }

  /**
   * テンプレートを読み込んでコンパイル
   */
  private async loadTemplate(templateName: string): Promise<handlebars.TemplateDelegate> {
    try {
      const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      return handlebars.compile(templateSource);
    } catch (error) {
      console.error(`テンプレート読み込みエラー: ${templateName}`, error);
      throw new Error(`メールテンプレートが見つかりません: ${templateName}`);
    }
  }

  /**
   * メール送信
   */
  async sendMail(options: EmailOptions): Promise<void> {
    try {
      // テンプレートをコンパイル
      const template = await this.loadTemplate(options.template);
      const html = template(options.data);

      // メール送信設定
      const mailOptions = {
        from: process.env.MAIL_FROM || 'noreply@construction-ec.com',
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        html,
      };

      // メール送信実行
      const info = await this.transporter.sendMail(mailOptions);
      console.log('メール送信成功:', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject,
      });

    } catch (error) {
      console.error('メール送信エラー:', error);
      throw new Error('メール送信に失敗しました');
    }
  }

  /**
   * 会員登録完了メール
   */
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    await this.sendMail({
      to: userEmail,
      subject: '【建設資材EC】会員登録完了のお知らせ',
      template: 'welcome',
      data: {
        userName,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@construction-ec.com',
      },
    });
  }

  /**
   * 注文受付メール
   */
  async sendOrderConfirmationEmail(
    userEmail: string,
    userName: string,
    orderData: any
  ): Promise<void> {
    await this.sendMail({
      to: userEmail,
      subject: `【建設資材EC】ご注文受付のお知らせ（注文番号: ${orderData.orderNumber}）`,
      template: 'order-confirmation',
      data: {
        userName,
        orderNumber: orderData.orderNumber,
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        shippingAddress: orderData.shippingAddress,
        orderDate: new Date().toLocaleDateString('ja-JP'),
        orderUrl: `${process.env.FRONTEND_URL}/account/orders/${orderData._id}`,
      },
    });
  }

  /**
   * 決済完了メール
   */
  async sendPaymentConfirmationEmail(
    userEmail: string,
    userName: string,
    orderData: any
  ): Promise<void> {
    await this.sendMail({
      to: userEmail,
      subject: `【建設資材EC】お支払い完了のお知らせ（注文番号: ${orderData.orderNumber}）`,
      template: 'payment-confirmation',
      data: {
        userName,
        orderNumber: orderData.orderNumber,
        totalAmount: orderData.totalAmount,
        paymentMethod: orderData.paymentMethod,
        paymentDate: new Date().toLocaleDateString('ja-JP'),
        orderUrl: `${process.env.FRONTEND_URL}/account/orders/${orderData._id}`,
      },
    });
  }

  /**
   * 発送完了メール
   */
  async sendShippingNotificationEmail(
    userEmail: string,
    userName: string,
    orderData: any
  ): Promise<void> {
    await this.sendMail({
      to: userEmail,
      subject: `【建設資材EC】商品発送完了のお知らせ（注文番号: ${orderData.orderNumber}）`,
      template: 'shipping-notification',
      data: {
        userName,
        orderNumber: orderData.orderNumber,
        trackingNumber: orderData.trackingNumber,
        shippingCompany: orderData.shippingCompany,
        shippedDate: new Date().toLocaleDateString('ja-JP'),
        trackingUrl: this.getTrackingUrl(orderData.shippingCompany, orderData.trackingNumber),
      },
    });
  }

  /**
   * パスワードリセットメール
   */
  async sendPasswordResetEmail(
    userEmail: string,
    userName: string,
    resetToken: string
  ): Promise<void> {
    await this.sendMail({
      to: userEmail,
      subject: '【建設資材EC】パスワード再設定のご案内',
      template: 'password-reset',
      data: {
        userName,
        resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
        expiryHours: 24,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@construction-ec.com',
      },
    });
  }

  /**
   * お問い合わせ受付メール（顧客向け）
   */
  async sendContactConfirmationEmail(
    userEmail: string,
    userName: string,
    contactData: any
  ): Promise<void> {
    await this.sendMail({
      to: userEmail,
      subject: '【建設資材EC】お問い合わせを受け付けました',
      template: 'contact-confirmation',
      data: {
        userName,
        inquiryType: contactData.inquiryType,
        message: contactData.message,
        responseTime: '2営業日以内',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@construction-ec.com',
      },
    });
  }

  /**
   * お問い合わせ通知メール（管理者向け）
   */
  async sendContactNotificationEmail(contactData: any): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@construction-ec.com';
    
    await this.sendMail({
      to: adminEmail,
      subject: `【建設資材EC】新しいお問い合わせ: ${contactData.inquiryType}`,
      template: 'contact-notification',
      data: {
        customerName: contactData.name,
        customerEmail: contactData.email,
        customerPhone: contactData.phone,
        inquiryType: contactData.inquiryType,
        message: contactData.message,
        submittedAt: new Date().toLocaleString('ja-JP'),
        adminUrl: `${process.env.FRONTEND_URL}/admin/contacts`,
      },
    });
  }

  /**
   * 新規注文通知メール（管理者向け）
   */
  async sendNewOrderNotificationEmail(orderData: any): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@construction-ec.com';
    
    await this.sendMail({
      to: adminEmail,
      subject: `【建設資材EC】新規注文受付（注文番号: ${orderData.orderNumber}）`,
      template: 'new-order-notification',
      data: {
        orderNumber: orderData.orderNumber,
        customerName: `${orderData.user.lastName} ${orderData.user.firstName}`,
        customerEmail: orderData.user.email,
        totalAmount: orderData.totalAmount,
        itemCount: orderData.items.length,
        orderDate: new Date().toLocaleString('ja-JP'),
        adminUrl: `${process.env.FRONTEND_URL}/admin/orders/${orderData._id}`,
      },
    });
  }

  /**
   * 配送業者の追跡URLを生成
   */
  private getTrackingUrl(shippingCompany: string, trackingNumber: string): string {
    switch (shippingCompany) {
      case 'ヤマト運輸':
        return `https://toi.kuronekoyamato.co.jp/cgi-bin/tneko?number=${trackingNumber}`;
      case '佐川急便':
        return `https://k2k.sagawa-exp.co.jp/p/web/okurijosearch.do?okurijoNo=${trackingNumber}`;
      case '日本郵便':
        return `https://trackings.post.japanpost.jp/services/srv/search/?requestNo1=${trackingNumber}`;
      default:
        return '';
    }
  }

  /**
   * 接続テスト
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('メールサーバー接続確認成功');
      return true;
    } catch (error) {
      console.error('メールサーバー接続エラー:', error);
      return false;
    }
  }
}

// シングルトンインスタンス
export const emailService = new EmailService(); 