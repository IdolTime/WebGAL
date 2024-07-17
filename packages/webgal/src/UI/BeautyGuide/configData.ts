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
}


export const personalInfoList: IPersonalInfo[] = [
    { 
        name: 'Una', 
        pictureUrl: pictureUrl1, 
        height: '168cm', 
        weight: '48kg', 
        bustSize: '90cm', 
        waistSize: '58cm', 
        hipSize: '86cm' ,
        description: '这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。',
        contentList: [
            {
                type: ContentTypeEnum.Video,
                url: 'https://videos.pexels.com/video-files/26957373/12036862_2560_1440_25fps.mp4',
                thumbnailUrl: 'http://gips0.baidu.com/it/u=3560029307,576412274&fm=3028&app=3028&f=JPEG&fmt=auto?w=960&h=1280'
            },
            {
                type: ContentTypeEnum.Video,
                url: 'https://videos.pexels.com/video-files/7204909/7204909-sd_360_640_30fps.mp4',
                thumbnailUrl: 'http://gips2.baidu.com/it/u=3944689179,983354166&fm=3028&app=3028&f=JPEG&fmt=auto?w=1024&h=1024'
            },
            {
                type: ContentTypeEnum.Image,
                url: 'https://wx2.sinaimg.cn/orj360/006TJIxply1hriwi6kxvrj31401e01kx.jpg',
                thumbnailUrl: 'https://wx2.sinaimg.cn/orj360/006TJIxply1hriwi6kxvrj31401e01kx.jpg'
            },
            {
                type: ContentTypeEnum.Image,
                url: 'https://wx4.sinaimg.cn/large/002diGk7ly1hrkdnwdu4zj60hi09uq3s02.jpg',
                thumbnailUrl: 'https://wx4.sinaimg.cn/large/002diGk7ly1hrkdnwdu4zj60hi09uq3s02.jpg'
            },
            {
                type: ContentTypeEnum.Image,
                url: 'https://images.pexels.com/photos/19640282/pexels-photo-19640282.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load',
                thumbnailUrl: 'https://images.pexels.com/photos/19640282/pexels-photo-19640282.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load'
            }
        ]
    },
    { 
        name: 'Nanyi', 
        pictureUrl: pictureUrl2, 
        height: '175cm', 
        weight: '45kg', 
        bustSize: '95cm', 
        waistSize: '54cm', 
        hipSize: '85cm',
        description: '这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。',
        contentList: [
            {
                type: ContentTypeEnum.Video,
                url: 'https://videos.pexels.com/video-files/26957373/12036862_2560_1440_25fps.mp4',
                thumbnailUrl: 'http://gips0.baidu.com/it/u=3560029307,576412274&fm=3028&app=3028&f=JPEG&fmt=auto?w=960&h=1280'
            },
            {
                type: ContentTypeEnum.Video,
                url: 'https://videos.pexels.com/video-files/7204909/7204909-sd_360_640_30fps.mp4',
                thumbnailUrl: 'http://gips2.baidu.com/it/u=3944689179,983354166&fm=3028&app=3028&f=JPEG&fmt=auto?w=1024&h=1024'
            },
            {
                type: ContentTypeEnum.Image,
                url: 'https://wx2.sinaimg.cn/orj360/006TJIxply1hriwi6kxvrj31401e01kx.jpg',
                thumbnailUrl: 'https://wx2.sinaimg.cn/orj360/006TJIxply1hriwi6kxvrj31401e01kx.jpg'
            },
            {
                type: ContentTypeEnum.Image,
                url: 'https://wx4.sinaimg.cn/large/002diGk7ly1hrkdnwdu4zj60hi09uq3s02.jpg',
                thumbnailUrl: 'https://wx4.sinaimg.cn/large/002diGk7ly1hrkdnwdu4zj60hi09uq3s02.jpg'
            },
            {
                type: ContentTypeEnum.Image,
                url: 'https://images.pexels.com/photos/19640282/pexels-photo-19640282.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load',
                thumbnailUrl: 'https://images.pexels.com/photos/19640282/pexels-photo-19640282.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load'
            }
        ]
    },
    { 
        name: 'Bonni', 
        pictureUrl: pictureUrl3, 
        height: '172cm', 
        weight: '47kg', 
        bustSize: '93cm', 
        waistSize: '55cm', 
        hipSize: '88cm',
        description: '这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。这是一段描述文字，字数控制在300字以内。',
        contentList: [
            {
                type: ContentTypeEnum.Video,
                url: 'https://videos.pexels.com/video-files/26957373/12036862_2560_1440_25fps.mp4',
                thumbnailUrl: 'http://gips0.baidu.com/it/u=3560029307,576412274&fm=3028&app=3028&f=JPEG&fmt=auto?w=960&h=1280'
            },
            {
                type: ContentTypeEnum.Video,
                url: 'https://videos.pexels.com/video-files/7204909/7204909-sd_360_640_30fps.mp4',
                thumbnailUrl: 'http://gips2.baidu.com/it/u=3944689179,983354166&fm=3028&app=3028&f=JPEG&fmt=auto?w=1024&h=1024'
            },
            {
                type: ContentTypeEnum.Image,
                url: 'https://wx2.sinaimg.cn/orj360/006TJIxply1hriwi6kxvrj31401e01kx.jpg',
                thumbnailUrl: 'https://wx2.sinaimg.cn/orj360/006TJIxply1hriwi6kxvrj31401e01kx.jpg'
            },
            {
                type: ContentTypeEnum.Image,
                url: 'https://wx4.sinaimg.cn/large/002diGk7ly1hrkdnwdu4zj60hi09uq3s02.jpg',
                thumbnailUrl: 'https://wx4.sinaimg.cn/large/002diGk7ly1hrkdnwdu4zj60hi09uq3s02.jpg'
            },
            {
                type: ContentTypeEnum.Image,
                url: 'https://images.pexels.com/photos/19640282/pexels-photo-19640282.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load',
                thumbnailUrl: 'https://images.pexels.com/photos/19640282/pexels-photo-19640282.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load'
            },





            {
                type: ContentTypeEnum.Image,
                url: 'https://wx2.sinaimg.cn/orj360/006TJIxply1hriwi6kxvrj31401e01kx.jpg',
                thumbnailUrl: 'https://wx2.sinaimg.cn/orj360/006TJIxply1hriwi6kxvrj31401e01kx.jpg'
            },
            {
                type: ContentTypeEnum.Image,
                url: 'https://wx4.sinaimg.cn/large/002diGk7ly1hrkdnwdu4zj60hi09uq3s02.jpg',
                thumbnailUrl: 'https://wx4.sinaimg.cn/large/002diGk7ly1hrkdnwdu4zj60hi09uq3s02.jpg'
            },
            {
                type: ContentTypeEnum.Image,
                url: 'https://images.pexels.com/photos/19640282/pexels-photo-19640282.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load',
                thumbnailUrl: 'https://images.pexels.com/photos/19640282/pexels-photo-19640282.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load'
            },
            {
                type: ContentTypeEnum.Image,
                url: 'https://wx2.sinaimg.cn/orj360/006TJIxply1hriwi6kxvrj31401e01kx.jpg',
                thumbnailUrl: 'https://wx2.sinaimg.cn/orj360/006TJIxply1hriwi6kxvrj31401e01kx.jpg'
            },
            {
                type: ContentTypeEnum.Image,
                url: 'https://wx4.sinaimg.cn/large/002diGk7ly1hrkdnwdu4zj60hi09uq3s02.jpg',
                thumbnailUrl: 'https://wx4.sinaimg.cn/large/002diGk7ly1hrkdnwdu4zj60hi09uq3s02.jpg'
            },
            {
                type: ContentTypeEnum.Image,
                url: 'https://images.pexels.com/photos/19640282/pexels-photo-19640282.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load',
                thumbnailUrl: 'https://images.pexels.com/photos/19640282/pexels-photo-19640282.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load'
            },
            {
                type: ContentTypeEnum.Image,
                url: 'https://wx2.sinaimg.cn/orj360/006TJIxply1hriwi6kxvrj31401e01kx.jpg',
                thumbnailUrl: 'https://wx2.sinaimg.cn/orj360/006TJIxply1hriwi6kxvrj31401e01kx.jpg'
            },
            {
                type: ContentTypeEnum.Image,
                url: 'https://wx4.sinaimg.cn/large/002diGk7ly1hrkdnwdu4zj60hi09uq3s02.jpg',
                thumbnailUrl: 'https://wx4.sinaimg.cn/large/002diGk7ly1hrkdnwdu4zj60hi09uq3s02.jpg'
            },
            {
                type: ContentTypeEnum.Image,
                url: 'https://images.pexels.com/photos/19640282/pexels-photo-19640282.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load',
                thumbnailUrl: 'https://images.pexels.com/photos/19640282/pexels-photo-19640282.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load'
            },
            {
                type: ContentTypeEnum.Image,
                url: 'https://wx2.sinaimg.cn/orj360/006TJIxply1hriwi6kxvrj31401e01kx.jpg',
                thumbnailUrl: 'https://wx2.sinaimg.cn/orj360/006TJIxply1hriwi6kxvrj31401e01kx.jpg'
            },
            {
                type: ContentTypeEnum.Image,
                url: 'https://wx4.sinaimg.cn/large/002diGk7ly1hrkdnwdu4zj60hi09uq3s02.jpg',
                thumbnailUrl: 'https://wx4.sinaimg.cn/large/002diGk7ly1hrkdnwdu4zj60hi09uq3s02.jpg'
            },
            {
                type: ContentTypeEnum.Image,
                url: 'https://images.pexels.com/photos/19640282/pexels-photo-19640282.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load',
                thumbnailUrl: 'https://images.pexels.com/photos/19640282/pexels-photo-19640282.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load'
            }
        ]
    }
];