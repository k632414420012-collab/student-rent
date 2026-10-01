// Common Types and Enums for BorrowMe (Student Rent Platform)

export type UserRole = 'RENTER' | 'LENDER' | 'ADMIN' | 'ORG';

export type ItemCondition = 'Mới 99%' | 'Rất tốt' | 'Tốt' | 'Khá';

export type ItemStatus = 'ACTIVE' | 'HIDDEN' | 'BANNED';

export type AvailabilityStatus = 'AVAILABLE' | 'BOOKED' | 'UNAVAILABLE';

export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'ACTIVE'
  | 'RETURNED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export type TransactionType =
  | 'RENTAL_PAYMENT'
  | 'DEPOSIT_HOLD'
  | 'DEPOSIT_REFUND'
  | 'DEPOSIT_DEDUCT'
  | 'LENDER_PAYOUT'
  | 'PREMIUM_FEE'
  | 'VERIFICATION_FEE';

export type DisputeStatus = 'OPEN' | 'RESOLVED' | 'REJECTED';

export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  isVerified: boolean;
  verifiedAt?: string | null;
  studentEmail?: string | null;
  studentCardNumber?: string | null;
  studentCardImage?: string | null;
  verificationStatus: VerificationStatus;
  verificationNote?: string | null;
  idCardNumber?: string | null;
  university?: string | null;
  createdAt?: string;
}

export interface ItemSummary {
  id: string;
  title: string;
  category: string;
  pricePerDay: number;
  depositAmount: number;
  imageUrl: string;
  location: string;
  condition: string;
  isPremium: boolean;
  isVerifiedLender: boolean;
  rating: number;
  reviewCount: number;
}
