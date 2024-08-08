interface IAuthor {
  userId: number;
  userName: string;
  nickname: string;
  avatar: string;
  gender: number;
  level: number;
  exp: number;
  vipType: number;
  personalizedSignature: string;
  bgId: number;
  bgUrl: string;
}

interface IClassification {
  classificationId: number;
  classificationName: string;
}

interface ITag {
  tagId: number;
  tagName: string;
}

interface ISale {
  id: number;
  gId: number;
  salesType: number;
  salesTypeText: string;
  salesAmount: number;
  regionCode: string;
  regionName: string;
}

interface IDiscount {
  id: number;
  gId: number;
  salesType: number;
  salesTypeText: string;
  discountAmount: number;
  startTime: string;
  endTime: string;
}

export interface IGameInfo {
  gId: number;
  name: string;
  summary: string;
  rating: number;
  description: string;
  link: string;
  isFree: number;
  tryPlay: number;
  salesAmountType: number;
  salesAmount: number;
  discountAmountType: number;
  discountAmount: number;
  authorId: number;
  coverPic: string;
  updateTag: number;
  state: number;
  approvalState: number;
  approvalLink: string;
  promotionalPic: string[];
  forwardCounts: number;
  readQuantity: number;
  wordCount: number;
  playCount: number;
  collectCount: number;
  gameCommentCounts: number;
  isCollect: boolean;
  isLike: boolean;
  likeCount: number;
  canPlay: boolean;
  goodPercentage: number;
  author: IAuthor;
  authorFansCounts: number;
  authorGameCounts: number;
  isFollowedAuthor: boolean;
  duration: number;
  lastLoginTime: string;
  classificationList: IClassification[];
  tagList: ITag[];
  sales: ISale[];
  discount: IDiscount[];
}
