// Category constants for Knarr

import {
  Heart,
  Briefcase,
  Users,
  Brain,
  DollarSign,
  Star,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import type { LifeGoal, FinanceAccount } from '../lib/types'

// Goal Category Config
export const GOAL_CATEGORIES: { value: LifeGoal['category']; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'health', label: 'Health', icon: Heart, color: 'text-blood-red' },
  { value: 'career', label: 'Career', icon: Briefcase, color: 'text-ember' },
  { value: 'relationships', label: 'Relationships', icon: Users, color: 'text-fjord' },
  { value: 'growth', label: 'Growth', icon: Brain, color: 'text-victory-green' },
  { value: 'financial', label: 'Financial', icon: DollarSign, color: 'text-ember' },
  { value: 'other', label: 'Other', icon: Star, color: 'text-fog' },
]

// Finance account type configuration
export const ACCOUNT_TYPES = [
  { value: 'cash', label: 'Cash', icon: DollarSign, is_asset: true },
  { value: 'checking', label: 'Checking', icon: DollarSign, is_asset: true },
  { value: 'savings', label: 'Savings', icon: DollarSign, is_asset: true },
  { value: 'investment', label: 'Investment', icon: TrendingUp, is_asset: true },
  { value: 'crypto', label: 'Crypto', icon: DollarSign, is_asset: true },
  { value: 'property', label: 'Property', icon: DollarSign, is_asset: true },
  { value: 'debt', label: 'Debt/Loan', icon: TrendingDown, is_asset: false },
  { value: 'other', label: 'Other', icon: DollarSign, is_asset: true },
] as const
