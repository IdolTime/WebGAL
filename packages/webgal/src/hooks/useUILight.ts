/**
 * 设置游戏亮度
 */

export const useUILight = (value: number) => {
    // const root = document.getElementById('root');
    const body = document.body;
    value = typeof value === 'string' ? Number(value) : value;
    if (body) {
        body.style.opacity = (value / 100).toFixed(2)
    }
};