import pictureUrl1 from '@/assets/imgs/pictureUrl_1.png';
import pictureUrl2 from '@/assets/imgs/pictureUrl_2.png';
import pictureUrl3 from '@/assets/imgs/pictureUrl_3.png';

export interface IPersonalInfo {
    name: string;
    pictureUrl: string;
    height: string;
    weight: string;
    bustSize: string; //胸围
    waistSize: string; //腰围
    hipSize: string; //臀围
    description?: string // 描述文字 300字以内
    contentList?: IContent[]
}

export interface IContent {
    type: ContentTypeEnum;
    url: string;
    thumbnailUrl: string; // 缩略图
}

export enum ContentTypeEnum {
    Video = 'video',
    Image = 'image',
    Placeholder = 'placeholder'
}
