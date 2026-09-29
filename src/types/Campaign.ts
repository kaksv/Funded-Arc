export interface Contributor {
  address: string;
  amount: number;
  refunded: boolean;
}

export type CampaignStatus = 'Active' | 'Successful' | 'Failed' | 'Withdrawn';

export interface Campaign {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  creator: string;
  creatorName: string;
  goalAmount: number;
  currentAmount: number;
  deadline: string;
  imageUrl: string;
  category: string;
  contributors: Contributor[];
  contributorCount: number;
  status: CampaignStatus;
  createdAt: string;
}

export interface NewCampaign {
  title: string;
  description: string;
  longDescription: string;
  creatorName: string;
  goalAmount: string;
  deadline: string;
  imageUrl: string;
  category: string;
}