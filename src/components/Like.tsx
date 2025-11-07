import React, { useEffect, useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import { createPortal } from 'react-dom';
// 赞赏码图片说明：
// - 图片现已移动到 Vite 的 public 目录，使用根路径引用。
// - 这样可确保在开发/生产环境中稳定加载。

/**
 * 文件说明：Like 组件
 * 功能：在导航栏左侧提供一个点赞按钮。点击后显示赞赏码的弹窗，支持点击遮罩关闭。
 * 依赖：`lucide-react` 图标库、TailwindCSS 样式；图片资源来自项目根目录 `赞赏码.jpg`。
 */

/**
 * Like 组件
 * 参数：无
 * 返回值：`JSX.Element`，包含点赞按钮与赞赏码弹窗结构
 * 异常：无显式抛出异常；若图片资源缺失可能导致图片加载失败，但不影响弹窗渲染
 */
const Like: React.FC = () => {
  // 控制赞赏码弹窗的可见性
  const [modalVisible, setModalVisible] = useState(false);
  // 图片加载错误状态，用于显示兜底提示
  // 参数：无；返回值：boolean；异常：无
  const [imageError, setImageError] = useState(false);

  /**
   * 处理点赞图标点击事件
   * 参数：无
   * 返回值：void
   * 异常：无
   */
  const handleIconClick = (): void => {
    setModalVisible(true);
  };

  /**
   * 关闭弹窗处理函数
   * 参数：无
   * 返回值：void
   * 异常：无
   */
  const handleCloseModal = (): void => {
    setModalVisible(false);
  };

  /**
   * 当弹窗打开时：
   * - 锁定页面滚动（body overflow hidden）
   * - 监听 ESC 键以便快速关闭
   */
  useEffect(() => {
    if (modalVisible) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleCloseModal();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = previousOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [modalVisible]);

  return (
    <div>
      <button
        onClick={handleIconClick}
        className="p-2 text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-sm hover:shadow-yellow-500/20"
        title="点赞"
        aria-label="点赞"
      >
        <ThumbsUp className="w-5 h-5" />
      </button>

      {modalVisible &&
        createPortal(
          <>
            {/* 遮罩层：覆盖整个视窗，点击关闭 */}
            <div
              className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm"
              onClick={handleCloseModal}
              aria-hidden="true"
            />

            {/* 弹窗主体：固定定位到视窗正中，不受父元素影响 */}
            <div
              className="fixed z-[1001] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(90vw,24rem)]"
              role="dialog"
              aria-modal="true"
            >
              <div
                className="bg-white p-6 rounded-lg shadow-2xl text-center w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold mb-3 text-gray-800">点个赞</h2>
                {imageError ? (
                  <div className="mx-auto rounded-lg bg-gray-100 text-gray-600 p-4 text-sm">
                    图片加载失败，请刷新或检查资源。
                  </div>
                ) : (
                  <img
                    src="/appreciation-code.jpg"
                    alt="赞赏码"
                    className="mx-auto rounded-lg shadow-md max-h-[50vh] w-auto"
                    onError={() => setImageError(true)}
                    loading="lazy"
                  />
                )}
                
                <button
                  onClick={handleCloseModal}
                  className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200 font-medium"
                >
                  关闭
                </button>
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
};

export default Like;