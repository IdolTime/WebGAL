/**
 * 设置游戏亮度
 */

export const useUILight = (value: number) => {
    const root = document.getElementById('root');
    value = typeof value === 'string' ? Number(value) : value;
    if (root) {
        root.style.opacity = (value / 100).toFixed(2)
    }
};