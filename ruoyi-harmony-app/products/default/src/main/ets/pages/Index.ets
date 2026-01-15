import { Home } from '../view/Home';
import { Work } from '../view/Work';
import { Mine } from '../view/mine/Mine';

/**
 * Index is the entry of application with main tabs.
 */
@Entry
@Component
struct Index {
  @State currentIndex: number = 0;
  private tabsController: TabsController = new TabsController();

  @Builder
  TabBuilder(title: string, index: number, icon: Resource) {
    Column() {
      SymbolGlyph(icon)
        .fontSize('24vp')
        .fontColor([this.currentIndex === index ? '#67C23A' : '#909399'])
        .margin({ bottom: '4vp' });
      Text(title)
        .fontSize('12vp')
        .fontColor(this.currentIndex === index ? '#67C23A' : '#909399');
    }
    .width('100%')
    .height('56vp')
    .justifyContent(FlexAlign.Center)
    .onClick(() => {
      this.currentIndex = index;
      this.tabsController.changeIndex(this.currentIndex);
    });
  }

  build() {
    Tabs({ barPosition: BarPosition.End, controller: this.tabsController }) {
      TabContent() {
        Home()
      }.tabBar(this.TabBuilder('首页', 0, $r('sys.symbol.house_fill')))

      TabContent() {
        Work()
      }.tabBar(this.TabBuilder('工作', 1, $r('sys.symbol.briefcase_fill')))

      TabContent() {
        Mine()
      }.tabBar(this.TabBuilder('我的', 2, $r('sys.symbol.person_fill')))
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#ffffff')
    .barHeight('56vp')
    .onChange((index: number) => {
      this.currentIndex = index;
    });
  }
}