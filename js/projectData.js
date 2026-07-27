/**
 * 项目数据管理
 * 包含所有航拍和三维模型项目数据
 */
var cardData = [
  { id: 1, image: 'images/720/view.png', name: '南沙航拍', link: 'https://720zf.com/t/9dd601ee01561040', tag: '航拍', isLarge: true, subscribe: true },
  { id: 2, image: 'images/720/nsyh.jpg', name: '南沙一号', link: 'model/nanshayihao/index.html', tag: '三维模型', isLarge: false, subscribe: false },
  { id: 3, image: 'images/720/slfy.jpg', name: '十里方圆三期', link: 'model/shilifangyuan/index.html', tag: '三维模型', isLarge: false, subscribe: false },
  // { id: 4, image: 'images/720/wqcg.jpg', name: '湾区茶馆环球店', link: 'model/teahouse/index.html', tag: '三维模型', isLarge: false, subscribe: false },
  { id: 5, image: 'images/720/91m.jpg', name: '香海彼岸91方', link: 'model/xianghaibian/91m/index.html', tag: '三维模型', isLarge: false, subscribe: false },
  { id: 6, image: 'images/720/hyz.jpg', name: '花屿宙', link: 'model/huayuzhou/index.html', tag: '三维模型', isLarge: false, subscribe: false },
  { id: 7, image: 'https://720static.jinfuyun.cn/19541/media/9bc02fd05f503405.png', name: '星河东悦府', link: 'frame.html?url=https://720zf.com/t/aa1c1d2c6be8f5dd', tag: '样板房', isLarge: false, subscribe: false },
  { id: 8, image: 'https://720static.jinfuyun.cn/19541/media/fd544b6c97582c0d.png', name: '南沙金茂湾', link: 'frame.html?url=https://720zf.com/t/5e3b6d0964d4162c', tag: '样板房', isLarge: false, subscribe: false },
  { id: 9, image: 'https://720static.jinfuyun.cn/19541/works/5e5f2c00c40c9a26/thumb.jpg', name: '海语熙岸', link: 'frame.html?url=https://720zf.com/t/47a4fcd30757f816', tag: '样板房', isLarge: false, subscribe: false },
  { id: 10, image: 'https://720static.jinfuyun.cn/19541/works/eca7c049817a7fe7/thumb.jpg', name: '美的江上春江', link: 'frame.html?url=https://720zf.com/t/bf705ae617795438', tag: '样板房', isLarge: false, subscribe: false },
  { id: 11, image: 'https://720static.jinfuyun.cn/19541/works/caa27d44b42ec530/thumb.jpg', name: '湾区金融城', link: 'frame.html?url=https://720zf.com/t/61b58e6777c8158d', tag: '样板房', isLarge: false, subscribe: false },
  { id: 12, image: 'https://720static.jinfuyun.cn/19541/works/c34160c50293eb78/thumb.jpg', name: '招商林屿境', link: 'frame.html?url=https://720zf.com/t/45a19a324668f8a3', tag: '样板房', isLarge: false, subscribe: false },
  { id: 13, image: 'https://720static.jinfuyun.cn/19541/works/a6546a581c960425/thumb.jpg', name: '海语天悦湾', link: 'frame.html?url=https://720zf.com/t/a6ddc69bc8731da4', tag: '样板房', isLarge: false, subscribe: false },
  { id: 14, image: 'https://720static.jinfuyun.cn/19541/media/27abb638f9c49043.png', name: '时代天逸', link: 'frame.html?url=https://720zf.com/t/677d97087cf14451', tag: '样板房', isLarge: false, subscribe: false },
  { id: 15, image: 'https://720static.jinfuyun.cn/19541/works/0bedfda490a49efc/thumb.jpg', name: '恒大阳光半岛', link: 'frame.html?url=https://720zf.com/t/37f130969f5ee002', tag: '样板房', isLarge: false, subscribe: false },
  { id: 16, image: 'https://720static.jinfuyun.cn/19541/works/36325f5672666b41/thumb.jpg', name: '华丰金湾', link: 'frame.html?url=https://720zf.com/t/3cde599d408466ee', tag: '样板房', isLarge: false, subscribe: false },
  { id: 17, image: 'https://720static.jinfuyun.cn/19541/media/84d3489748e12cef.png', name: '茗筑水岸', link: 'frame.html?url=https://720zf.com/t/b676fed0845a0969', tag: '样板房', isLarge: false, subscribe: false },
  { id: 18, image: 'https://720static.jinfuyun.cn/19541/media/33fb692e4644147a.png', name: '绿城桂语汀澜', link: 'frame.html?url=https://720zf.com/t/4c35faba88cb2631', tag: '样板房', isLarge: false, subscribe: false },
  { id: 19, image: 'https://720static.jinfuyun.cn/19541/media/76214d4cb64a38fd.png', name: '深业颐泽府', link: 'frame.html?url=https://720zf.com/t/0eb4f071f83bc743', tag: '样板房', isLarge: false, subscribe: false },
  { id: 20, image: 'https://720static.jinfuyun.cn/19541/media/022431366ceb27bb.png', name: '西派澜岸', link: 'frame.html?url=https://720zf.com/t/ef2ad9f4854ea378', tag: '样板房', isLarge: false, subscribe: false },
  { id: 21, image: 'https://720static.jinfuyun.cn/19541/works/f97d4d63d41a4334/thumb.jpg', name: '金科博翠明珠', link: 'frame.html?url=https://720zf.com/t/25a3f742adc47844', tag: '样板房', isLarge: false, subscribe: false },
  { id: 22, image: 'https://720static.jinfuyun.cn/19541/media/a5ed6f01b979cf80.png', name: '绿城晓风印月', link: 'frame.html?url=https://720zf.com/t/b6448bdb11203834', tag: '样板房', isLarge: false, subscribe: false },
  { id: 23, image: 'https://720static.jinfuyun.cn/19541/media/712c88084534487d.png', name: '花语上城', link: 'frame.html?url=https://720zf.com/t/ebd247e752d10f05', tag: '样板房', isLarge: false, subscribe: false },
  { id: 24, image: 'https://720static.jinfuyun.cn/19541/works/9cc9ade6531ade39/thumb.jpg', name: '阳光城丽景半岛', link: 'frame.html?url=https://720zf.com/t/1a311231e8512b2f', tag: '样板房', isLarge: false, subscribe: false },
  { id: 25, image: 'https://720static.jinfuyun.cn/19541/works/ff9f37975107d3ae/thumb.jpg', name: '能建天誉府', link: 'frame.html?url=https://720zf.com/t/ed2e37ef646af801', tag: '样板房', isLarge: false, subscribe: false },
  { id: 26, image: 'https://720static.jinfuyun.cn/19541/works/95cdb125d70a60f9/thumb.jpg', name: '十里方圆三期', link: 'frame.html?url=https://720zf.com/t/122105ad3abaa7c6', tag: '样板房', isLarge: false, subscribe: false },
  { id: 27, image: 'https://720static.jinfuyun.cn/19541/works/43c8151e4748967d/thumb.jpg', name: '星河东悦府', link: 'frame.html?url=https://720zf.com/t/9fbeb785ae4f633e', tag: '样板房', isLarge: false, subscribe: false },
  { id: 28, image: 'https://720static.jinfuyun.cn/19541/works/6a839a64e14922ab/thumb.jpg', name: '越秀天珹', link: 'frame.html?url=https://720zf.com/t/6d90627f2cce8756', tag: '样板房', isLarge: false, subscribe: false },
];