import { INDEX_ROUTE, LOGIN_ROUTE } from '../../constants/RouteConstants';

interface UserProfile {
  userId?: number;
  userName?: string;
  nickName?: string;
  avatar?: string;
}

@Component
export struct Mine {
  @StorageLink('user') user: UserProfile = {};
  @StorageLink('token') token: string = '';

  private handleLogout(): void {
    // 清除存储
    AppStorage.setOrCreate('token', '');
    AppStorage.setOrCreate('user', {});
    AppStorage.setOrCreate('roles', []);
    AppStorage.setOrCreate('permissions', []);
    
    // 跳转回登录页
    const uiContext = this.getUIContext();
    if (uiContext) {
      uiContext.getRouter().replaceUrl({
        url: LOGIN_ROUTE
      });
    }
  }

  @Builder
  menuItem(icon: Resource, label: string, showArrow: boolean = true) {
    Row() {
      SymbolGlyph(icon)
        .fontSize('22vp')
        .fontColor(['#67C23A'])
        .margin({ right: '12vp' });
      Text(label)
        .fontSize('16vp')
        .fontColor('#303133')
        .layoutWeight(1);
      if (showArrow) {
        SymbolGlyph($r('sys.symbol.chevron_right'))
          .fontSize('20vp')
          .fontColor(['#C0C4CC']);
      }
    }
    .width('100%')
    .padding('16vp')
    .backgroundColor('#ffffff')
    .border({ width: { bottom: '1px' }, color: '#f5f5f5' });
  }

  build(): void {
    Scroll() {
      Column() {
        // 用户头部区域
        Column({ space: 12 }) {
          // 头像占位
          Stack() {
            SymbolGlyph($r('sys.symbol.person_fill'))
              .fontSize('48vp')
              .fontColor(['#67C23A']);
          }
          .width('80vp')
          .height('80vp')
          .borderRadius('40vp')
          .backgroundColor('#f5f5f5');

          Text(this.user && this.user.userName ? this.user.userName : '未登录')
            .fontSize('22vp')
            .fontWeight(FontWeight.Medium)
            .fontColor('#303133');

          Text(this.user && this.user.nickName ? this.user.nickName : '这家伙很懒，什么都没留下')
            .fontSize('14vp')
            .fontColor('#909399');
        }
        .width('100%')
        .padding({ top: '60vp', bottom: '40vp' })
        .backgroundColor('#ffffff');

        // 信息卡片
        Column({ space: 12 }) {
          Row() {
            SymbolGlyph($r('sys.symbol.checkmark_circle_fill'))
              .fontSize('28vp')
              .fontColor(['#67C23A'])
              .margin({ right: '8vp' });
            Text('HarmonyOS 原生应用')
              .fontSize('18vp')
              .fontWeight(FontWeight.Bold)
              .fontColor('#303133');
          }
          .width('100%')
          .alignItems(VerticalAlign.Center);

          Text('基于 ArkTS 开发，支持 HarmonyOS Next 运行环境，体验流畅的原生性能。')
            .fontSize('14vp')
            .fontColor('#606266')
            .lineHeight('20vp');
        }
        .margin('16vp')
        .padding('20vp')
        .backgroundColor('#ffffff')
        .borderRadius('12vp');

        // 菜单列表
        Column() {
          this.menuItem($r('sys.symbol.person_fill'), '个人信息');
          this.menuItem($r('sys.symbol.gearshape_fill'), '账号设置');
          this.menuItem($r('sys.symbol.info_circle_fill'), '关于我们');
          this.menuItem($r('sys.symbol.questionmark_circle_fill'), '帮助中心');
        }
        .width('100%')
        .backgroundColor('#ffffff')
        .margin({ top: '8vp', bottom: '20vp' });

        // 退出登录按钮
        Button() {
          Row() {
            SymbolGlyph($r('sys.symbol.power'))
              .fontSize('20vp')
              .fontColor(['#F56C6C'])
              .margin({ right: '8vp' });
            Text('退出登录')
              .fontSize('16vp')
              .fontWeight(FontWeight.Bold)
              .fontColor('#F56C6C');
          }
        }
        .width('90%')
        .height('50vp')
        .borderRadius('25vp')
        .backgroundColor('#ffffff')
        .margin({ bottom: '40vp' })
        .onClick(() => this.handleLogout())
        .border({ width: '1px', color: '#f5f5f5' });
      }
      .width('100%')
      .backgroundColor('#f5f5f5');
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#f5f5f5')
    .scrollBar(BarState.Off);
  }
}
