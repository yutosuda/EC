import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import express from 'express';
import path from 'path';
import fs from 'fs';

// OpenAPIのベース設定
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '建設資材ECサイト API',
      version: '1.0.0',
      description: '建設資材ECサイトのREST API仕様書',
      contact: {
        name: '管理者',
        email: 'admin@example.com',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'API サーバー',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            comparePrice: { type: 'number' },
            sku: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            mainImage: { type: 'string' },
            category: { type: 'string' },
            manufacturer: { type: 'string' },
            brand: { type: 'string' },
            specifications: { type: 'object' },
            stock: { type: 'number' },
            isUsed: { type: 'boolean' },
            isVisible: { type: 'boolean' },
            tags: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            slug: { type: 'string' },
            isActive: { type: 'boolean' },
            order: { type: 'number' },
            parentCategory: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phoneNumber: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            orderNumber: { type: 'string' },
            user: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'payment_failed'] },
            items: { 
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { type: 'string' },
                  quantity: { type: 'number' },
                  price: { type: 'number' },
                  name: { type: 'string' },
                },
              },
            },
            shippingAddress: {
              type: 'object',
              properties: {
                postalCode: { type: 'string' },
                prefecture: { type: 'string' },
                city: { type: 'string' },
                address1: { type: 'string' },
                address2: { type: 'string' },
                phoneNumber: { type: 'string' },
              },
            },
            paymentMethod: { type: 'string', enum: ['credit_card', 'bank_transfer'] },
            paymentIntentId: { type: 'string' },
            subtotal: { type: 'number' },
            tax: { type: 'number' },
            shippingFee: { type: 'number' },
            discount: { type: 'number' },
            totalAmount: { type: 'number' },
            couponCode: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Cart: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { type: 'string' },
                  quantity: { type: 'number' },
                  price: { type: 'number' },
                  addedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
            totalAmount: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        PaymentIntent: {
          type: 'object',
          properties: {
            clientSecret: { type: 'string' },
          },
        },
      },
      responses: {
        NotFound: {
          description: '指定されたリソースが見つかりません',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'リソースが見つかりません' },
                },
              },
            },
          },
        },
        Unauthorized: {
          description: '認証エラー',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: '認証が必要です' },
                },
              },
            },
          },
        },
        Forbidden: {
          description: '権限エラー',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'この操作を行う権限がありません' },
                },
              },
            },
          },
        },
        ValidationError: {
          description: '入力検証エラー',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: '入力データが無効です' },
                  errors: { 
                    type: 'array', 
                    items: { 
                      type: 'object',
                      properties: {
                        field: { type: 'string' },
                        message: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.resolve(__dirname, '../routes/*.ts'),
    path.resolve(__dirname, '../routes/*.js'),
    path.resolve(__dirname, '../controllers/*.ts'),
    path.resolve(__dirname, '../controllers/*.js'),
  ],
};

// Swagger仕様を作成
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// OpenAPIファイルを出力（開発時のデバッグ用）
export const writeSwaggerJson = () => {
  const outputPath = path.resolve(__dirname, '../../openapi.json');
  fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
  console.log(`OpenAPI仕様が ${outputPath} に出力されました`);
};

// Expressアプリケーションにマウントするための関数
export const setupSwagger = (app: express.Application) => {
  // Swagger UI ミドルウェアをマウント
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
  }));

  // OpenAPI JSON ファイルにアクセスするためのエンドポイント
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  console.log('Swagger UI が /api-docs でマウントされました');
}; 