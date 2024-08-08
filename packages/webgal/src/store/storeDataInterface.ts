import { IGameInfo } from '@/services/storeInterface';

export interface IPaymentConfiguration {
  id: number;
  g_id: number;
  product_id: number;
  chapter?: number;
  buy_type: 1 | 2;
  buy_type_text: string;
  sales_type: number;
  sales_type_text: string;
  sales_amount: number;
  is_pay: number;
  is_buy: boolean;
}

export type IPaymentConfigurationList = IPaymentConfiguration[];

export interface IStoreData {
  paymentConfigurationList: IPaymentConfigurationList;
  gameInfo: IGameInfo | null;
  isEditorPreviewMode: boolean;
}
