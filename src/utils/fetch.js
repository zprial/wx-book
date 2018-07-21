/* eslint-disable */
// 通用请求
export default (url, params, showLoading = true) => {
  if (showLoading) {
    wx.showLoading({
      title: '请求中',
      mask: true
    });
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: 'GET',
      dataType: 'json',
      ...params,
      success(data) {
        if (data.data) {
          resolve(data.data);
        } else {
          reject(new Error(data.errMsg));
        }
      },
      fail(error) {
        wx.showToast({
          title: error.errMsg || '请求失败',
          icon: 'none',
          duration: 2000
        });
        reject(error);
      },
      complete() {
        wx.hideLoading();
      }
    })
  })
}
