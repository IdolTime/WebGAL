import { language } from '@/config/language';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import cloneDeep from 'lodash/cloneDeep';
import { ISetGameVar } from './stageInterface';
import { IPaymentConfigurationList, IStoreData } from './storeDataInterface';

// 初始化用户数据
export const initState: IStoreData = {
  paymentConfigurationList: [],
};

const storeDataSlice = createSlice({
  name: 'storeData',
  initialState: cloneDeep(initState),
  reducers: {
    setPaymentConfigurationList(state, action: PayloadAction<IPaymentConfigurationList>) {
      state.paymentConfigurationList = action.payload;
    },
  },
});

export const { setPaymentConfigurationList } = storeDataSlice.actions;
export default storeDataSlice.reducer;
