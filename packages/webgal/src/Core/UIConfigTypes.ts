export enum TitleSceneButtonKey {
  Game_start_button = 'Game_start_button', // 开始
  Game_achievement_button = 'Game_achievement_button', // 成就
  Game_storyline_button = 'Game_storyline_button', // 故事线
  Game_extra_button = 'Game_extra_button', // bgm和图片收藏
  Game_collection_button = 'Game_collection_button', // 图鉴
  Game_option_button = 'Game_option_button', // 设置
  Game_load_button = 'Game_load_button', // 读取
  Game_continue_button = 'Game_continue_button', // 继续游戏
}

export interface UIItemConfig {
  label: string;
  type?: 'image' | 'text' | 'container' | 'placeholder' | 'bgm' | 'bg';
  hasHoverStyle?: boolean;
  hasXY?: boolean;
  hasWidthHeight?: boolean;
  hasText?: boolean;
  positionType?: 'absolute' | 'relative';
  customStyle?: {
    marginLeft?: {
      type: 'number';
      label: string;
    };
    marginRight?: {
      type: 'number';
      label: string;
    };
    columnGap?: {
      type: 'number';
      label: string;
    };
    rowGap?: {
      type: 'number';
      label: string;
    };
    gap?: {
      type: 'number';
      label: string;
    };
  };
}

export enum IndicatorItemKey {
  indicatorLeft = 'indicatorLeft',
  indicatorRight = 'indicatorRight',
  indicator = 'indicator',
}

export enum CommonItemKey {
  content = 'content',
  background = 'background',
  extra = 'extra',
}

export enum SliderItemKey {
  slider = 'slider',
  sliderBg = 'sliderBg',
  sliderThumb = 'sliderThumb',
}

export interface ContainerItem {
  key: AllKey;
  content: '';
  args: {
    hide: boolean;
    style?: Style;
    hoverStyle?: Style;
    contentStyle?: Style;
    contentHoverStyle?: Style;
    backgroundStyle?: Style;
    backgroundHoverStyle?: Style;
    extraStyle?: Style;
    extraHoverStyle?: Style;
  };
}

export interface SliderContainerItem {
  key: AllKey;
  content: '';
  args: {
    hide: boolean;
    style?: Style;
    sliderStyle?: Style;
    sliderBgStyle?: Style;
    sliderThumbStyle?: Style;
  };
}

export interface IndicatorContainerItem {
  key: AllKey;
  content: '';
  args: {
    hide: boolean;
    style?: Style;
    indicatorStyle?: Style;
    indicatorHoverStyle?: Style;
    indicatorLeftStyle?: Style;
    indicatorLeftHoverStyle?: Style;
    indicatorRightStyle?: Style;
    indicatorRightHoverStyle?: Style;
  };
}

export const titleSceneButtonConfig: Record<TitleSceneButtonKey, UIItemConfig> = {
  [TitleSceneButtonKey.Game_start_button]: {
    hasHoverStyle: true,
    label: '开始游戏',
  },
  [TitleSceneButtonKey.Game_achievement_button]: {
    hasHoverStyle: true,
    label: '成就',
  },
  [TitleSceneButtonKey.Game_storyline_button]: {
    hasHoverStyle: true,
    label: '故事线',
  },
  [TitleSceneButtonKey.Game_extra_button]: {
    hasHoverStyle: true,
    label: '鉴赏',
  },
  [TitleSceneButtonKey.Game_collection_button]: {
    hasHoverStyle: true,
    label: '图鉴',
  },
  [TitleSceneButtonKey.Game_option_button]: {
    hasHoverStyle: true,
    label: '设置',
  },
  [TitleSceneButtonKey.Game_load_button]: {
    hasHoverStyle: true,
    label: '读取存档',
  },
  [TitleSceneButtonKey.Game_continue_button]: {
    hasHoverStyle: true,
    label: '继续游戏',
  },
};

export enum LoadSceneButtonKey {
  Load_back_button = 'Load_back_button',
}

export const loadSceneButtonConfig: Record<
  LoadSceneButtonKey,
  UIItemConfig & { children?: Record<string, UIItemConfig> }
> = {
  [LoadSceneButtonKey.Load_back_button]: {
    hasHoverStyle: true,
    label: '返回',
  },
};

export enum StorylineSceneButtonKey {
  Storyline_back_button = 'Storyline_back_button',
}

export const storylineSceneButtonConfig: Record<StorylineSceneButtonKey, UIItemConfig> = {
  [StorylineSceneButtonKey.Storyline_back_button]: {
    hasHoverStyle: true,
    label: '返回',
  },
};

export enum AchievementSceneButtonKey {
  Achievement_back_button = 'Achievement_back_button',
}

export const achievementSceneButtonConfig: Record<AchievementSceneButtonKey, UIItemConfig> = {
  [AchievementSceneButtonKey.Achievement_back_button]: {
    label: '返回',
  },
};

export enum ExtraSceneButtonKey {
  Extra_back_button = 'Extra_back_button',
  Extra_bgm_button = 'Extra_bgm_button',
  Extra_video_button = 'Extra_video_button',
}

export const extraSceneButtonConfig: Record<ExtraSceneButtonKey, UIItemConfig> = {
  [ExtraSceneButtonKey.Extra_back_button]: {
    label: '返回',
  },
  [ExtraSceneButtonKey.Extra_bgm_button]: {
    label: '切换BGM标签',
  },
  [ExtraSceneButtonKey.Extra_video_button]: {
    label: '切换VIDEO标签',
  },
};

export enum ExtraSceneOtherKey {
  Extra_title = 'Extra_title',
  Extra_bg = 'Extra_bg',
  Extra_bgm_locked_item_bg = 'Extra_bgm_locked_item_bg',
  Extra_bgm_unlocked_item = 'Extra_bgm_unlocked_item',
  Extra_video_unlocked_item = 'Extra_video_unlocked_item',
  Extra_indicator = 'Extra_indicator',
  Extra_video_locked_item_bg = 'Extra_video_locked_item_bg',
}

export const extraSceneOtherConfig: Record<
  ExtraSceneOtherKey,
  UIItemConfig & {
    children?: { [key: string]: UIItemConfig };
  }
> = {
  [ExtraSceneOtherKey.Extra_title]: {
    label: '标题',
  },
  [ExtraSceneOtherKey.Extra_bg]: {
    hasHoverStyle: false,
    label: '背景',
    type: 'bg',
  },
  [ExtraSceneOtherKey.Extra_bgm_locked_item_bg]: {
    label: '未解锁BGM元素背景',
    hasXY: false,
    hasHoverStyle: false,
    customStyle: {
      columnGap: {
        type: 'number',
        label: '列间距',
      },
      rowGap: {
        type: 'number',
        label: '行间距',
      },
    },
  },
  [ExtraSceneOtherKey.Extra_bgm_unlocked_item]: {
    type: 'container',
    label: '已解锁BGM元素',
    hasXY: false,
    hasHoverStyle: false,
    customStyle: {
      columnGap: {
        type: 'number',
        label: '列间距',
      },
      rowGap: {
        type: 'number',
        label: '行间距',
      },
    },
    children: {
      [CommonItemKey.content]: {
        type: 'text',
        label: '已解锁bgm文字元素',
      },
      [CommonItemKey.background]: {
        type: 'image',
        hasText: false,
        label: 'bgm元素背景',
      },
      [CommonItemKey.extra]: {
        type: 'image',
        hasText: false,
        label: '播放按钮',
      },
    },
  },
  [ExtraSceneOtherKey.Extra_video_unlocked_item]: {
    type: 'container',
    label: '已解锁VIDEO元素',
    hasXY: false,
    hasHoverStyle: false,
    children: {
      [CommonItemKey.content]: {
        type: 'placeholder',
        label: '已解锁video图片元素',
      },
      [CommonItemKey.background]: {
        type: 'image',
        hasText: false,
        label: 'video元素背景',
      },
    },
  },
  [ExtraSceneOtherKey.Extra_video_locked_item_bg]: {
    label: '未解锁VIDEO元素背景',
    hasXY: false,
    hasHoverStyle: false,
  },
  [ExtraSceneOtherKey.Extra_indicator]: {
    type: 'container',
    label: '翻页指示器',
    hasHoverStyle: false,
    hasWidthHeight: false,
    children: {
      [IndicatorItemKey.indicatorLeft]: {
        hasHoverStyle: true,
        positionType: 'relative',
        label: '向左翻页',
        customStyle: {
          marginRight: {
            type: 'number',
            label: '右边距',
          },
        },
      },
      [IndicatorItemKey.indicatorRight]: {
        hasHoverStyle: true,
        positionType: 'relative',
        label: '向右翻页',
        customStyle: {
          marginLeft: {
            type: 'number',
            label: '左边距',
          },
        },
      },
      [IndicatorItemKey.indicator]: {
        hasHoverStyle: true,
        positionType: 'relative',
        label: '指示器',
        customStyle: {
          gap: {
            type: 'number',
            label: '间隔',
          },
        },
      },
    },
  },
};

export enum OptionSceneButtonKey {
  Option_back_button = 'Option_back_button',
}

export const optionSceneButtonConfig: Record<OptionSceneButtonKey, UIItemConfig> = {
  [OptionSceneButtonKey.Option_back_button]: {
    label: '返回',
  },
};

export enum OptionSceneOtherKey {
  Option_title = 'Option_title',
  Option_bg = 'Option_bg',
  Option_window_label = 'Option_window_label',
  Option_text_speed_label = 'Option_text_speed_label',
  Option_global_volume_label = 'Option_global_volume_label',
  Option_bg_music_volume_label = 'Option_bg_music_volume_label',
  Option_effect_volume_label = 'Option_effect_volume_label',
  Option_voice_volume_label = 'Option_voice_volume_label',
  Option_voice_slider = 'Option_voice_slider',
  Option_text_speed_slider = 'Option_text_speed_slider',
  Option_global_volume_slider = 'Option_global_volume_slider',
  Option_bg_music_volume_slider = 'Option_bg_music_volume_slider',
  Option_effect_volume_slider = 'Option_effect_volume_slider',
  Option_fullscreen_checkbox_label = 'Option_fullscreen_checkbox_label',
  Option_window_checkbox_label = 'Option_window_checkbox_label',
  Option_fullscreen_checkbox = 'Option_fullscreen_checkbox',
  Option_window_checkbox = 'Option_window_checkbox',
}

export const optionSceneOtherConfig: Record<
  OptionSceneOtherKey,
  UIItemConfig & { children?: Record<string, UIItemConfig> }
> = {
  [OptionSceneOtherKey.Option_title]: {
    type: 'image',
    label: '标题',
  },
  [OptionSceneOtherKey.Option_bg]: {
    label: '背景',
    type: 'bg',
    hasHoverStyle: false,
  },
  [OptionSceneOtherKey.Option_window_label]: {
    type: 'container',
    label: '画面模式',
    children: {
      [CommonItemKey.content]: {
        type: 'text',
        label: '画面模式文字元素',
      },
      [CommonItemKey.background]: {
        type: 'image',
        hasText: false,
        label: '画面模式背景',
      },
    },
  },
  [OptionSceneOtherKey.Option_text_speed_label]: {
    type: 'container',
    label: '文本速度',
    children: {
      [CommonItemKey.content]: {
        type: 'text',
        label: '文本速度文字元素',
      },
      [CommonItemKey.background]: {
        type: 'image',
        hasText: false,
        label: '文本速度背景',
      },
    },
  },
  [OptionSceneOtherKey.Option_global_volume_label]: {
    type: 'container',
    label: '全局音量',
    children: {
      [CommonItemKey.content]: {
        type: 'text',
        label: '全局音量文字元素',
      },
      [CommonItemKey.background]: {
        type: 'image',
        hasText: false,
        label: '全局音量背景',
      },
    },
  },
  [OptionSceneOtherKey.Option_bg_music_volume_label]: {
    type: 'container',
    label: '背景音量',
    children: {
      [CommonItemKey.content]: {
        type: 'text',
        label: '背景音量文字元素',
      },
      [CommonItemKey.background]: {
        type: 'image',
        hasText: false,
        label: '背景音量背景',
      },
    },
  },
  [OptionSceneOtherKey.Option_effect_volume_label]: {
    type: 'container',
    label: '音效音量',
    children: {
      [CommonItemKey.content]: {
        type: 'text',
        label: '音效音量文字元素',
      },
      [CommonItemKey.background]: {
        type: 'image',
        hasText: false,
        label: '音效音量背景',
      },
    },
  },
  [OptionSceneOtherKey.Option_fullscreen_checkbox_label]: {
    type: 'container',
    label: '全屏模式',
    children: {
      [CommonItemKey.content]: {
        type: 'text',
        label: '全屏模式文字元素',
      },
      [CommonItemKey.background]: {
        type: 'image',
        hasText: false,
        label: '全屏模式背景',
      },
    },
  },
  [OptionSceneOtherKey.Option_window_checkbox_label]: {
    type: 'container',
    label: '窗口模式',
    children: {
      [CommonItemKey.content]: {
        type: 'text',
        label: '窗口模式文字元素',
      },
      [CommonItemKey.background]: {
        type: 'image',
        hasText: false,
        label: '窗口模式背景',
      },
    },
  },
  [OptionSceneOtherKey.Option_voice_volume_label]: {
    type: 'container',
    label: '语音音量',
    children: {
      [CommonItemKey.content]: {
        type: 'text',
        label: '语音音量文字元素',
      },
      [CommonItemKey.background]: {
        type: 'image',
        hasText: false,
        label: '语音音量背景',
      },
    },
  },
  [OptionSceneOtherKey.Option_voice_slider]: {
    type: 'container',
    label: '语音音量',
    children: {
      [SliderItemKey.slider]: {
        label: '语音音量滑动条',
        hasHoverStyle: false,
      },
      [SliderItemKey.sliderBg]: {
        hasHoverStyle: false,
        label: '语音音量滑动条背景',
      },
      [SliderItemKey.sliderThumb]: {
        hasHoverStyle: false,
        label: '语音音量滑动条拇指',
      },
    },
  },
  [OptionSceneOtherKey.Option_global_volume_slider]: {
    type: 'container',
    label: '全局音量',
    children: {
      [SliderItemKey.slider]: {
        label: '全局音量滑动条',
        hasHoverStyle: false,
      },
      [SliderItemKey.sliderBg]: {
        hasHoverStyle: false,
        label: '全局音量滑动条背景',
      },
      [SliderItemKey.sliderThumb]: {
        hasHoverStyle: false,
        label: '全局音量滑动条拇指',
      },
    },
  },
  [OptionSceneOtherKey.Option_bg_music_volume_slider]: {
    type: 'container',
    label: '背景音量',
    children: {
      [SliderItemKey.slider]: {
        label: '背景音量滑动条',
        hasHoverStyle: false,
      },
      [SliderItemKey.sliderBg]: {
        hasHoverStyle: false,
        label: '背景音量滑动条背景',
      },
      [SliderItemKey.sliderThumb]: {
        hasHoverStyle: false,
        label: '背景音量滑动条拇指',
      },
    },
  },
  [OptionSceneOtherKey.Option_effect_volume_slider]: {
    type: 'container',
    label: '音效音量',
    children: {
      [SliderItemKey.slider]: {
        label: '音效音量滑动条',
        hasHoverStyle: false,
      },
      [SliderItemKey.sliderBg]: {
        hasHoverStyle: false,
        label: '音效音量滑动条背景',
      },
      [SliderItemKey.sliderThumb]: {
        hasHoverStyle: false,
        label: '音效音量滑动条拇指',
      },
    },
  },
  [OptionSceneOtherKey.Option_fullscreen_checkbox]: {
    label: '全屏模式复选框',
  },
  [OptionSceneOtherKey.Option_window_checkbox]: {
    label: '窗口模式复选框',
  },
  [OptionSceneOtherKey.Option_text_speed_slider]: {
    type: 'container',
    label: '文本速度滑动条',
    children: {
      [SliderItemKey.slider]: {
        label: '文本速度滑动条',
        hasHoverStyle: false,
      },
      [SliderItemKey.sliderBg]: {
        hasHoverStyle: false,
        label: '文本速度滑动条背景',
      },
      [SliderItemKey.sliderThumb]: {
        hasHoverStyle: false,
        label: '文本速度滑动条拇指',
      },
    },
  },
};

export enum AchievementSceneOtherKey {
  Achievement_title = 'Achievement_title',
}

export const achievementSceneOtherConfig: Record<AchievementSceneOtherKey, UIItemConfig> = {
  [AchievementSceneOtherKey.Achievement_title]: {
    label: '标题',
  },
};

export enum StorylineSceneOtherKey {
  Storyline_title = 'Storyline_title',
}

export const storylineSceneOtherConfig: Record<StorylineSceneOtherKey, UIItemConfig> = {
  [StorylineSceneOtherKey.Storyline_title]: {
    label: '标题',
  },
};

export enum LoadSceneOtherKey {
  Load_bg = 'Load_bg',
  Load_title = 'Load_title',
  Load_item = 'Load_item',
  Load_locked_item = 'Load_locked_item',
  Load_indicator = 'Load_indicator',
}

export const loadSceneOtherConfig: Record<
  LoadSceneOtherKey,
  UIItemConfig & { children?: Record<string, UIItemConfig> }
> = {
  [LoadSceneOtherKey.Load_bg]: {
    hasHoverStyle: false,
    label: '背景',
    type: 'bg',
  },
  [LoadSceneOtherKey.Load_title]: {
    label: '标题',
  },
  [LoadSceneOtherKey.Load_item]: {
    label: '存档元素',
    type: 'container',
    hasXY: false,
    hasHoverStyle: false,
    customStyle: {
      rowGap: {
        type: 'number',
        label: '行间距',
      },
      columnGap: {
        type: 'number',
        label: '列间距',
      },
    },
    children: {
      [CommonItemKey.content]: {
        type: 'placeholder',
        label: '存档图片',
      },
      [CommonItemKey.background]: {
        type: 'image',
        hasText: false,
        label: '存档元素背景',
      },
      [CommonItemKey.extra]: {
        type: 'text',
        label: '存档文字',
      },
    },
  },
  [LoadSceneOtherKey.Load_locked_item]: {
    label: '未解锁存档元素',
    hasXY: false,
    customStyle: {
      rowGap: {
        type: 'number',
        label: '行间距',
      },
      columnGap: {
        type: 'number',
        label: '列间距',
      },
    },
  },
  [LoadSceneOtherKey.Load_indicator]: {
    type: 'container',
    hasHoverStyle: false,
    hasWidthHeight: false,
    label: '翻页指示器',
    children: {
      [IndicatorItemKey.indicatorLeft]: {
        hasHoverStyle: true,
        positionType: 'relative',
        label: '向左翻页',
        customStyle: {
          marginRight: {
            type: 'number',
            label: '右边距',
          },
        },
      },
      [IndicatorItemKey.indicatorRight]: {
        hasHoverStyle: true,
        positionType: 'relative',
        label: '向右翻页',
        customStyle: {
          marginLeft: {
            type: 'number',
            label: '左边距',
          },
        },
      },
      [IndicatorItemKey.indicator]: {
        hasHoverStyle: true,
        positionType: 'relative',
        label: '指示器',
        customStyle: {
          gap: {
            type: 'number',
            label: '间距',
          },
        },
      },
    },
  },
};

export enum TitleSceneOtherKey {
  Title_img = 'Title_img',
  Title_bgm = 'Title_bgm',
}

export const titleSceneOtherConfig: Record<TitleSceneOtherKey, UIItemConfig> = {
  [TitleSceneOtherKey.Title_img]: {
    hasHoverStyle: false,
    label: '背景',
    type: 'bg',
  },
  [TitleSceneOtherKey.Title_bgm]: {
    hasHoverStyle: false,
    label: '背景音乐',
    type: 'bgm',
  },
};

export interface Style {
  x?: number;
  y?: number;
  scale?: number;
  image?: string;
  fontSize?: number;
  fontColor?: string;
  countdown?: number;
  position?: 'absolute' | 'relative';
  gap?: number;
  rowGap?: number;
  columnGap?: number;
  width?: number;
  height?: number;
  marginLeft?: number;
  marginRight?: number;
}

export type ButtonKey =
  | LoadSceneButtonKey
  | TitleSceneButtonKey
  | OptionSceneButtonKey
  | StorylineSceneButtonKey
  | AchievementSceneButtonKey
  | ExtraSceneButtonKey;
export type OtherKey =
  | LoadSceneOtherKey
  | TitleSceneOtherKey
  | OptionSceneOtherKey
  | StorylineSceneOtherKey
  | AchievementSceneOtherKey
  | ExtraSceneOtherKey;
type AllKey = ButtonKey | OtherKey;

export interface ButtonItem {
  key: AllKey;
  content: string;
  args: {
    hide: boolean;
    style: Style;
    hoverStyle?: Style;
  };
}

export interface TitleSceneUIConfig {
  key: Scene.title;
  other: { [key in TitleSceneOtherKey]: ButtonItem };
  buttons: { [key in TitleSceneButtonKey]: ButtonItem };
}

export interface LoadSceneUIConfig {
  key: Scene.load;
  other: {
    [LoadSceneOtherKey.Load_bg]: ButtonItem;
    [LoadSceneOtherKey.Load_title]: ButtonItem;
    [LoadSceneOtherKey.Load_item]: ContainerItem;
    [LoadSceneOtherKey.Load_locked_item]: ButtonItem;
    [LoadSceneOtherKey.Load_indicator]: IndicatorContainerItem;
  };
  buttons: { [key in LoadSceneButtonKey]: ButtonItem };
}

export interface StorylineSceneUIConfig {
  key: Scene.storyline;
  other: { [key in StorylineSceneOtherKey]: ButtonItem };
  buttons: { [key in StorylineSceneButtonKey]: ButtonItem };
}

export interface AchievementSceneUIConfig {
  key: Scene.achievement;
  other: { [key in AchievementSceneOtherKey]: ButtonItem };
  buttons: { [key in AchievementSceneButtonKey]: ButtonItem };
}

export interface ExtraSceneUIConfig {
  key: Scene.extra;
  other: {
    [ExtraSceneOtherKey.Extra_bg]: ButtonItem;
    [ExtraSceneOtherKey.Extra_title]: ButtonItem;
    [ExtraSceneOtherKey.Extra_bgm_locked_item_bg]: ButtonItem;
    [ExtraSceneOtherKey.Extra_bgm_unlocked_item]: ContainerItem;
    [ExtraSceneOtherKey.Extra_indicator]: IndicatorContainerItem;
    [ExtraSceneOtherKey.Extra_video_unlocked_item]: ContainerItem;
    [ExtraSceneOtherKey.Extra_video_locked_item_bg]: ButtonItem;
  };
  buttons: { [key in ExtraSceneButtonKey]: ButtonItem };
}

export interface OptionSceneUIConfig {
  key: Scene.option;
  other: {
    [OptionSceneOtherKey.Option_bg]: ButtonItem;
    [OptionSceneOtherKey.Option_title]: ButtonItem;
    [OptionSceneOtherKey.Option_window_label]: ContainerItem;
    [OptionSceneOtherKey.Option_text_speed_label]: ContainerItem;
    [OptionSceneOtherKey.Option_text_speed_slider]: SliderContainerItem;
    [OptionSceneOtherKey.Option_bg_music_volume_label]: ContainerItem;
    [OptionSceneOtherKey.Option_bg_music_volume_slider]: SliderContainerItem;
    [OptionSceneOtherKey.Option_effect_volume_label]: ContainerItem;
    [OptionSceneOtherKey.Option_effect_volume_slider]: SliderContainerItem;
    [OptionSceneOtherKey.Option_fullscreen_checkbox_label]: ContainerItem;
    [OptionSceneOtherKey.Option_fullscreen_checkbox]: ButtonItem;
    [OptionSceneOtherKey.Option_window_checkbox_label]: ContainerItem;
    [OptionSceneOtherKey.Option_window_checkbox]: ButtonItem;
    [OptionSceneOtherKey.Option_global_volume_label]: ContainerItem;
    [OptionSceneOtherKey.Option_global_volume_slider]: SliderContainerItem;
    [OptionSceneOtherKey.Option_voice_slider]: SliderContainerItem;
    [OptionSceneOtherKey.Option_voice_volume_label]: ContainerItem;
  };
  buttons: { [key in OptionSceneButtonKey]: ButtonItem };
}

export enum Scene {
  title = 'title',
  load = 'load',
  storyline = 'storyline',
  achievement = 'achievement',
  extra = 'extra',
  option = 'option',
  // collection = 'collection',
}

export const sceneNameMap: Record<Scene, string> = {
  title: '标题界面',
  load: '读档界面',
  storyline: '故事线界面',
  achievement: '成就界面',
  extra: '鉴赏界面',
  option: '选项界面',
  // collection: '图鉴界面',
};

export interface SceneUIConfig {
  [Scene.title]?: TitleSceneUIConfig;
  [Scene.load]?: LoadSceneUIConfig;
  [Scene.storyline]?: StorylineSceneUIConfig;
  [Scene.achievement]?: AchievementSceneUIConfig;
  [Scene.extra]?: ExtraSceneUIConfig;
  [Scene.option]?: OptionSceneUIConfig;
  // [Scene.collection]: CollectionSceneUIConfig
}

export const SceneKeyMap = {
  [Scene.title]: {
    buttons: TitleSceneButtonKey,
    other: TitleSceneOtherKey,
  },
  [Scene.load]: {
    buttons: LoadSceneButtonKey,
    other: LoadSceneOtherKey,
  },
  [Scene.storyline]: {
    buttons: StorylineSceneButtonKey,
    other: StorylineSceneOtherKey,
  },
  [Scene.achievement]: {
    buttons: AchievementSceneButtonKey,
    other: AchievementSceneOtherKey,
  },
  [Scene.extra]: {
    buttons: ExtraSceneButtonKey,
    other: ExtraSceneOtherKey,
  },
  [Scene.option]: {
    buttons: OptionSceneButtonKey,
    other: OptionSceneOtherKey,
  },
};

const generateArgs = (extraStyles: string[] = []) => {
  const args = {
    hide: false,
    style: {},
  };

  extraStyles.forEach((style) => {
    // @ts-ignore
    args[style] = {};
  });

  return args;
};

export const sceneUIConfig: SceneUIConfig = {
  [Scene.title]: {
    key: Scene.title,
    other: {
      [TitleSceneOtherKey.Title_img]: {
        key: TitleSceneOtherKey.Title_img,
        content: '',
        args: {
          hide: false,
          style: {},
        },
      },
      [TitleSceneOtherKey.Title_bgm]: {
        key: TitleSceneOtherKey.Title_bgm,
        content: '',
        args: generateArgs(),
      },
    },
    buttons: {
      [TitleSceneButtonKey.Game_start_button]: {
        key: TitleSceneButtonKey.Game_start_button,
        content: '',
        args: generateArgs(['hoverStyle']),
      },
      [TitleSceneButtonKey.Game_load_button]: {
        key: TitleSceneButtonKey.Game_load_button,
        content: '',
        args: generateArgs(['hoverStyle']),
      },
      [TitleSceneButtonKey.Game_option_button]: {
        key: TitleSceneButtonKey.Game_option_button,
        content: '',
        args: generateArgs(['hoverStyle']),
      },
      [TitleSceneButtonKey.Game_storyline_button]: {
        key: TitleSceneButtonKey.Game_storyline_button,
        content: '',
        args: generateArgs(['hoverStyle']),
      },
      [TitleSceneButtonKey.Game_achievement_button]: {
        key: TitleSceneButtonKey.Game_achievement_button,
        content: '',
        args: generateArgs(['hoverStyle']),
      },
      [TitleSceneButtonKey.Game_extra_button]: {
        key: TitleSceneButtonKey.Game_extra_button,
        content: '',
        args: generateArgs(['hoverStyle']),
      },
      [TitleSceneButtonKey.Game_collection_button]: {
        key: TitleSceneButtonKey.Game_collection_button,
        content: '',
        args: generateArgs(['hoverStyle']),
      },
      [TitleSceneButtonKey.Game_continue_button]: {
        key: TitleSceneButtonKey.Game_continue_button,
        content: '',
        args: generateArgs(['hoverStyle']),
      },
    },
  },
  [Scene.load]: {
    key: Scene.load,
    other: {
      [LoadSceneOtherKey.Load_bg]: {
        key: LoadSceneOtherKey.Load_bg,
        content: '',
        args: generateArgs(),
      },
      [LoadSceneOtherKey.Load_title]: {
        key: LoadSceneOtherKey.Load_title,
        content: '',
        args: generateArgs(['hoverStyle']),
      },
      [LoadSceneOtherKey.Load_item]: {
        key: LoadSceneOtherKey.Load_item,
        content: '',
        args: generateArgs([
          'contentStyle',
          'backgroundStyle',
          'extraStyle',
          'contentHoverStyle',
          'backgroundHoverStyle',
          'extraHoverStyle',
        ]),
      },
      [LoadSceneOtherKey.Load_indicator]: {
        key: LoadSceneOtherKey.Load_indicator,
        content: '',
        args: generateArgs([
          'indicatorStyle',
          'indicatorHoverStyle',
          'indicatorLeftStyle',
          'indicatorLeftHoverStyle',
          'indicatorRightStyle',
          'indicatorRightHoverStyle',
        ]),
      },
      [LoadSceneOtherKey.Load_locked_item]: {
        key: LoadSceneOtherKey.Load_locked_item,
        content: '',
        args: generateArgs(['hoverStyle']),
      },
    },
    buttons: {
      [LoadSceneButtonKey.Load_back_button]: {
        key: LoadSceneButtonKey.Load_back_button,
        content: '',
        args: generateArgs(['hoverStyle']),
      },
    },
  },
  [Scene.storyline]: {
    key: Scene.storyline,
    other: {
      [StorylineSceneOtherKey.Storyline_title]: {
        key: StorylineSceneOtherKey.Storyline_title,
        content: '',
        args: generateArgs(['hoverStyle']),
      },
    },
    buttons: {
      [StorylineSceneButtonKey.Storyline_back_button]: {
        key: StorylineSceneButtonKey.Storyline_back_button,
        content: '',
        args: generateArgs(['hoverStyle']),
      },
    },
  },
  [Scene.achievement]: {
    key: Scene.achievement,
    other: {
      [AchievementSceneOtherKey.Achievement_title]: {
        key: AchievementSceneOtherKey.Achievement_title,
        content: '',
        args: generateArgs(['hoverStyle']),
      },
    },
    buttons: {
      [AchievementSceneButtonKey.Achievement_back_button]: {
        key: AchievementSceneButtonKey.Achievement_back_button,
        content: '',
        args: generateArgs(['hoverStyle']),
      },
    },
  },
  [Scene.extra]: {
    key: Scene.extra,
    other: {
      [ExtraSceneOtherKey.Extra_title]: {
        key: ExtraSceneOtherKey.Extra_title,
        content: '',
        args: generateArgs(['hoverStyle']),
      },
      [ExtraSceneOtherKey.Extra_bgm_unlocked_item]: {
        key: ExtraSceneOtherKey.Extra_bgm_unlocked_item,
        content: '',
        args: generateArgs([
          'contentStyle',
          'backgroundStyle',
          'extraStyle',
          'backgroundHoverStyle',
          'extraHoverStyle',
        ]),
      },
      [ExtraSceneOtherKey.Extra_bgm_locked_item_bg]: {
        key: ExtraSceneOtherKey.Extra_bgm_locked_item_bg,
        content: '',
        args: generateArgs(),
      },
      [ExtraSceneOtherKey.Extra_indicator]: {
        key: ExtraSceneOtherKey.Extra_indicator,
        content: '',
        args: generateArgs([
          'indicatorStyle',
          'indicatorHoverStyle',
          'indicatorLeftStyle',
          'indicatorLeftHoverStyle',
          'indicatorRightStyle',
          'indicatorRightHoverStyle',
        ]),
      },
      [ExtraSceneOtherKey.Extra_bg]: {
        key: ExtraSceneOtherKey.Extra_bg,
        content: '',
        args: generateArgs(),
      },
      [ExtraSceneOtherKey.Extra_video_locked_item_bg]: {
        key: ExtraSceneOtherKey.Extra_video_locked_item_bg,
        content: '',
        args: generateArgs(),
      },
      [ExtraSceneOtherKey.Extra_video_unlocked_item]: {
        key: ExtraSceneOtherKey.Extra_video_unlocked_item,
        content: '',
        args: generateArgs([
          'contentStyle',
          'backgroundStyle',
          'extraStyle',
          'contentHoverStyle',
          'backgroundHoverStyle',
          'extraHoverStyle',
        ]),
      },
    },
    buttons: {
      [ExtraSceneButtonKey.Extra_back_button]: {
        key: ExtraSceneButtonKey.Extra_back_button,
        content: '',
        args: generateArgs(['hoverStyle']),
      },
      [ExtraSceneButtonKey.Extra_video_button]: {
        key: ExtraSceneButtonKey.Extra_video_button,
        content: '',
        args: generateArgs(['hoverStyle']),
      },
      [ExtraSceneButtonKey.Extra_bgm_button]: {
        key: ExtraSceneButtonKey.Extra_bgm_button,
        content: '',
        args: generateArgs(['hoverStyle']),
      },
    },
  },
  [Scene.option]: {
    key: Scene.option,
    other: {
      [OptionSceneOtherKey.Option_bg]: {
        key: OptionSceneOtherKey.Option_bg,
        content: '',
        args: generateArgs(),
      },
      [OptionSceneOtherKey.Option_title]: {
        key: OptionSceneOtherKey.Option_title,
        content: '',
        args: generateArgs(['hoverStyle']),
      },
      [OptionSceneOtherKey.Option_window_label]: {
        key: OptionSceneOtherKey.Option_window_label,
        content: '',
        args: generateArgs(['contentStyle', 'backgroundStyle', 'backgroundHoverStyle']),
      },
      [OptionSceneOtherKey.Option_text_speed_label]: {
        key: OptionSceneOtherKey.Option_text_speed_label,
        content: '',
        args: generateArgs(['contentStyle', 'backgroundStyle', 'backgroundHoverStyle']),
      },
      [OptionSceneOtherKey.Option_voice_volume_label]: {
        key: OptionSceneOtherKey.Option_voice_volume_label,
        content: '',
        args: generateArgs(['contentStyle', 'backgroundStyle', 'backgroundHoverStyle']),
      },
      [OptionSceneOtherKey.Option_window_checkbox_label]: {
        key: OptionSceneOtherKey.Option_text_speed_label,
        content: '',
        args: generateArgs(['contentStyle', 'backgroundStyle', 'backgroundHoverStyle']),
      },
      [OptionSceneOtherKey.Option_global_volume_label]: {
        key: OptionSceneOtherKey.Option_global_volume_label,
        content: '',
        args: generateArgs(['contentStyle', 'backgroundStyle', 'backgroundHoverStyle']),
      },
      [OptionSceneOtherKey.Option_bg_music_volume_label]: {
        key: OptionSceneOtherKey.Option_bg_music_volume_label,
        content: '',
        args: generateArgs(['contentStyle', 'backgroundStyle', 'backgroundHoverStyle']),
      },
      [OptionSceneOtherKey.Option_effect_volume_label]: {
        key: OptionSceneOtherKey.Option_effect_volume_label,
        content: '',
        args: generateArgs(['contentStyle', 'backgroundStyle', 'backgroundHoverStyle']),
      },
      [OptionSceneOtherKey.Option_fullscreen_checkbox_label]: {
        key: OptionSceneOtherKey.Option_fullscreen_checkbox_label,
        content: '',
        args: generateArgs(['contentStyle', 'backgroundStyle', 'backgroundHoverStyle']),
      },
      [OptionSceneOtherKey.Option_bg_music_volume_slider]: {
        key: OptionSceneOtherKey.Option_bg_music_volume_slider,
        content: '',
        args: generateArgs(['sliderStyle', 'sliderBgStyle', 'sliderThumbStyle']),
      },
      [OptionSceneOtherKey.Option_effect_volume_slider]: {
        key: OptionSceneOtherKey.Option_effect_volume_slider,
        content: '',
        args: generateArgs(['sliderStyle', 'sliderBgStyle', 'sliderThumbStyle']),
      },
      [OptionSceneOtherKey.Option_text_speed_slider]: {
        key: OptionSceneOtherKey.Option_text_speed_slider,
        content: '',
        args: generateArgs(['sliderStyle', 'sliderBgStyle', 'sliderThumbStyle']),
      },
      [OptionSceneOtherKey.Option_fullscreen_checkbox]: {
        key: OptionSceneOtherKey.Option_fullscreen_checkbox,
        content: '',
        args: generateArgs(['hoverStyle']),
      },
      [OptionSceneOtherKey.Option_window_checkbox]: {
        key: OptionSceneOtherKey.Option_window_checkbox,
        content: '',
        args: generateArgs(['hoverStyle']),
      },
      [OptionSceneOtherKey.Option_global_volume_slider]: {
        key: OptionSceneOtherKey.Option_global_volume_slider,
        content: '',
        args: generateArgs(['sliderStyle', 'sliderBgStyle', 'sliderThumbStyle']),
      },
      [OptionSceneOtherKey.Option_voice_slider]: {
        key: OptionSceneOtherKey.Option_voice_slider,
        content: '',
        args: generateArgs(['sliderStyle', 'sliderBgStyle', 'sliderThumbStyle']),
      },
    },
    buttons: {
      [OptionSceneButtonKey.Option_back_button]: {
        key: OptionSceneButtonKey.Option_back_button,
        content: '',
        args: generateArgs(['hoverStyle']),
      },
    },
  },
  // [Scene.collection]: collectionSceneConfig,
};

export const sceneButtonConfig = {
  [Scene.title]: titleSceneButtonConfig,
  [Scene.load]: loadSceneButtonConfig,
  [Scene.storyline]: storylineSceneButtonConfig,
  [Scene.achievement]: achievementSceneButtonConfig,
  [Scene.extra]: extraSceneButtonConfig,
  [Scene.option]: optionSceneButtonConfig,
  // [Scene.collection]: collectionSceneButtonConfig
};

export const sceneOtherConfig = {
  [Scene.title]: titleSceneOtherConfig,
  [Scene.load]: loadSceneOtherConfig,
  [Scene.storyline]: storylineSceneOtherConfig,
  [Scene.achievement]: achievementSceneOtherConfig,
  [Scene.extra]: extraSceneOtherConfig,
  [Scene.option]: optionSceneOtherConfig,
  // [Scene.collection]: collectionSceneOtherConfig
};

export const bgKey = {
  [TitleSceneOtherKey.Title_img]: 1,
  [LoadSceneOtherKey.Load_bg]: 1,
  [ExtraSceneOtherKey.Extra_bg]: 1,
  [OptionSceneOtherKey.Option_bg]: 1,
};