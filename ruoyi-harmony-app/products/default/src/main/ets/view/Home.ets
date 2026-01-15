@Component
export struct Home {
  @StorageLink('user') user: Record<string, string | number | boolean | null | undefined> = {};

  build() {
    Column() {
      // 顶部 Header
      Row() {
        Text('RuoYi AI')
          .fontSize('20vp')
          .fontWeight(FontWeight.Bold)
          .fontColor('#ffffff');
      }
      .width('100%')
      .height('56vp')
      .padding({ left: '16vp', right: '16vp' })
      .backgroundColor('#67C23A');

      Scroll() {
        Column({ space: 16 }) {
          // 欢迎语
          Column({ space: 4 }) {
            Text('欢迎回来，' + (this.user && this.user.userName ? (this.user.userName as string) : '用户'))
              .fontSize('24vp')
              .fontWeight(FontWeight.Bold)
              .fontColor('#303133');
            Text('今天是 2026年1月9日')
              .fontSize('14vp')
              .fontColor('#909399');
          }
          .width('100%')
          .padding('20vp')
          .alignItems(HorizontalAlign.Start);

          // 模拟统计数据
          Row({ space: 12 }) {
            this.statCard('今日消息', '128', '#409EFF', $r('sys.symbol.envelope_fill'))
            this.statCard('待办任务', '5', '#F56C6C', $r('sys.symbol.checkmark_circle_fill'))
          }
          .width('100%')
          .padding({ left: '16vp', right: '16vp' });

          // 更多占位内容
          Column() {
            Row() {
              SymbolGlyph($r('sys.symbol.bell_fill'))
                .fontSize('20vp')
                .fontColor(['#67C23A'])
                .margin({ right: '8vp' });
              Text('最近动态')
                .fontSize('18vp')
                .fontWeight(FontWeight.Bold);
            }
            .width('100%')
            .margin({ bottom: '12vp' });
            
          ForEach([1, 2, 3], (item: number) => {
            Row() {
              SymbolGlyph($r('sys.symbol.circle_fill'))
                .fontSize('12vp')
                .fontColor(['#67C23A'])
                .margin({ right: '12vp' });
                Column({ space: 4 }) {
                  Text('系统更新通知 ' + item)
                    .fontSize('16vp')
                    .fontColor('#303133');
                  Text('2026-01-09 10:00:00')
                    .fontSize('12vp')
                    .fontColor('#909399');
                }
                .alignItems(HorizontalAlign.Start);
              }
              .width('100%')
              .padding({ top: '12vp', bottom: '12vp' })
              .border({ width: { bottom: '1px' }, color: '#f5f5f5' });
            })
          }
          .width('100%')
          .padding('20vp')
          .backgroundColor('#ffffff')
          .borderRadius('12vp')
          .margin({ left: '16vp', right: '16vp' });
        }
      }
      .layoutWeight(1);
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#f5f5f5');
  }

  @Builder
  statCard(label: string, value: string, color: string, icon: Resource) {
    Column({ space: 8 }) {
      Row() {
        SymbolGlyph(icon)
          .fontSize('16vp')
          .fontColor([color])
          .margin({ right: '4vp' });
        Text(label)
          .fontSize('14vp')
          .fontColor('#909399');
      }
      Text(value)
        .fontSize('28vp')
        .fontWeight(FontWeight.Bold)
        .fontColor(color);
    }
    .layoutWeight(1)
    .padding('16vp')
    .backgroundColor('#ffffff')
    .borderRadius('12vp')
    .shadow({ radius: 10, color: '#10000000', offsetX: 0, offsetY: 2 });
  }
}
