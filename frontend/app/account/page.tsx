'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { Layout } from '@/components/layout/Layout';
import { formatDate } from '@/lib/utils/date';
import { UserCircleIcon, PencilIcon } from '@heroicons/react/24/outline';

const AccountPage = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading, subscription } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [formData, setFormData] = useState({
    email: 'user@example.com',
    password: '',
    confirmPassword: '',
    phone: '',
    backupEmail: '',
  });

  // Mock user data
  const mockUserData = {
    username: 'gold_tiger_official',
    joinDate: new Date('2024-01-01'),
    followers: 0,
    following: 0,
    posts: 0,
    email: 'user@example.com',
    phone: '',
    backupEmail: '',
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getPlanName = (tier?: string) => {
    switch (tier) {
      case 'FREE':
        return '무료';
      case 'BASIC':
        return '베이직';
      case 'PRO':
        return '프로';
      case 'PREMIUM':
        return '프리미엄';
      default:
        return '무료';
    }
  };

  const getPlanColor = (tier?: string) => {
    switch (tier) {
      case 'FREE':
        return 'bg-gray-100 text-gray-800';
      case 'BASIC':
        return 'bg-blue-100 text-blue-800';
      case 'PRO':
        return 'bg-purple-100 text-purple-800';
      case 'PREMIUM':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              계정 설정
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              프로필 정보와 개인정보를 관리하세요
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Public Profile */}
            <div className="space-y-8">
              {/* Profile Info Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircleIcon className="w-32 h-32 text-gray-400" />
                    )}
                    <label
                      htmlFor="profile-image"
                      className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-2 cursor-pointer hover:bg-indigo-700 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4 text-white" />
                    </label>
                    <input
                      type="file"
                      id="profile-image"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold text-gray-900">
                    {mockUserData.username}
                  </h2>
                  <p className="text-sm text-gray-500">
                    가입일: {formatDate(mockUserData.joinDate)}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex justify-center gap-8 mt-6">
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-gray-900">{mockUserData.followers}</p>
                      <p className="text-sm text-gray-500">팔로워</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-gray-900">{mockUserData.following}</p>
                      <p className="text-sm text-gray-500">팔로잉</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-gray-900">{mockUserData.posts}</p>
                      <p className="text-sm text-gray-500">스크립트</p>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mt-8 w-full">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium text-gray-900">자기소개</h3>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        {isEditing ? '완료' : '수정'}
                      </button>
                    </div>
                    {isEditing ? (
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="자기소개를 작성해주세요"
                      />
                    ) : bio ? (
                      <p className="text-gray-600">{bio}</p>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
                      >
                        자기소개 작성하기
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Subscription Info Card - Moved here */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      현재 구독 플랜
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(subscription?.tier)}`}>
                        {getPlanName(subscription?.tier)}
                      </span>
                      <span className="text-gray-600">
                        {subscription?.status === 'active' ? '구독 중' : '만료됨'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/pricing')}
                    className="mt-4 md:mt-0 px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    플랜 변경
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Private Info */}
            <div className="space-y-8">
              {/* Personal Info Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  개인정보 수정
                </h2>
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이메일
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="이메일 주소"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      비밀번호 변경
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="새 비밀번호"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      비밀번호 확인
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="새 비밀번호 확인"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      전화번호
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="전화번호 입력"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      예비 이메일
                    </label>
                    <input
                      type="email"
                      name="backupEmail"
                      value={formData.backupEmail}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="예비 이메일 주소"
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      변경사항 저장
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AccountPage; 