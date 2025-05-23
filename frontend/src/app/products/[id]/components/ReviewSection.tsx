'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/authContext';

interface Review {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  approved: boolean;
}

interface ReviewSectionProps {
  productId: string;
}

const StarRating = ({ rating, onRatingChange, readonly = false }: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`text-2xl ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          } transition-transform ${
            star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'
          }`}
          onClick={() => !readonly && onRatingChange?.(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          disabled={readonly}
        >
          ★
        </button>
      ))}
    </div>
  );
};

const ReviewCard = ({ review }: { review: Review }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-gray-900">
            {review.user.lastName} {review.user.firstName}
          </h4>
          <p className="text-sm text-gray-500">
            {new Date(review.createdAt).toLocaleDateString('ja-JP')}
          </p>
        </div>
        <StarRating rating={review.rating} readonly />
      </div>
      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
    </div>
  );
};

const ReviewForm = ({ productId, onReviewSubmitted }: {
  productId: string;
  onReviewSubmitted: () => void;
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('評価を選択してください');
      return;
    }
    
    if (comment.trim().length < 10) {
      setError('レビューは10文字以上で入力してください');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setRating(0);
        setComment('');
        onReviewSubmitted();
        alert('レビューを投稿しました。承認後に表示されます。');
      } else {
        setError(data.message || 'レビューの投稿に失敗しました');
      }
    } catch (error) {
      console.error('レビュー投稿エラー:', error);
      setError('レビューの投稿に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">レビューを投稿</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          評価 <span className="text-red-500">*</span>
        </label>
        <StarRating rating={rating} onRatingChange={setRating} />
      </div>

      <div className="mb-4">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          コメント <span className="text-red-500">*</span>
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="商品の使用感や満足度について詳しくお聞かせください..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          maxLength={500}
        />
        <p className="text-sm text-gray-500 mt-1">
          {comment.length}/500文字 (最小10文字)
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? '投稿中...' : 'レビューを投稿'}
      </button>
    </form>
  );
};

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reviews/product/${productId}`);
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);
      } else {
        setError(data.message || 'レビューの取得に失敗しました');
      }
    } catch (error) {
      console.error('レビュー取得エラー:', error);
      setError('レビューの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleReviewSubmitted = () => {
    fetchReviews();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* レビューサマリー */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          カスタマーレビュー
        </h2>
        
        {totalReviews > 0 ? (
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <StarRating rating={Math.round(averageRating)} readonly />
              <span className="text-lg font-semibold">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-600">
              {totalReviews}件のレビュー
            </span>
          </div>
        ) : (
          <p className="text-gray-600 mb-6">
            まだレビューがありません。最初のレビューを投稿してみませんか？
          </p>
        )}

        {/* レビュー投稿フォーム */}
        {user ? (
          <ReviewForm
            productId={productId}
            onReviewSubmitted={handleReviewSubmitted}
          />
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-600 mb-4">
              レビューを投稿するにはログインが必要です
            </p>
            <a
              href="/login"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              ログイン
            </a>
          </div>
        )}
      </div>

      {/* レビュー一覧 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {reviews.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">
            レビュー一覧
          </h3>
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 