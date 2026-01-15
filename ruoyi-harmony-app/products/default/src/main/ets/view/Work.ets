interface WorkItem {
  title: string;
  desc: string;
  icon: Resource;
  color: string;
}

@Component
export struct Work {
  private workItems: WorkItem[] = [
    { title: '我的任务', desc: '待处理任务 3 条', icon: $r('sys.symbol.doc_text_fill'), color: '#409EFF' },
    { title: '我的审批', desc: '待审批 5 条', icon: $r('sys.symbol.checkmark_circle_fill'), color: '#F56C6C' },
    { title: '我的日程', desc: '今日日程 2 个', icon: $r('sys.symbol.calendar_fill'), color: '#67C23A' },
    { title: '工作报表', desc: '查看数据报表', icon: $r('sys.symbol.doc_text_fill'), color: '#E6A23C' }
  ]

  build() {
    Column() {
      // 顶部 Header
      Row() {
        Text('工作台')
          .fontSize('20vp')
          .fontWeight(FontWeight.Bold)
          .fontColor('#303133')
          .layoutWeight(1);
        
        SymbolGlyph($r('sys.symbol.plus_circle'))
          .fontSize('24vp')
          .fontColor(['#303133'])
          .margin({ right: '12vp' });
        
        SymbolGlyph($r('sys.symbol.square_grid_2x2'))
          .fontSize('24vp')
          .fontColor(['#303133']);
      }
      .width('100%')
      .height('56vp')
      .padding({ left: '16vp', right: '16vp' })
      .backgroundColor('#ffffff')
      .border({ width: { bottom: '1px' }, color: '#f5f5f5' });

      Scroll() {
        Column({ space: 12 }) {
          ForEach(this.workItems, (item: WorkItem) => {
            Row() {
              SymbolGlyph(item.icon)
                .fontSize('32vp')
                .fontColor([item.color]);

              Column({ space: 4 }) {
                Text(item.title)
                  .fontSize('16vp')
                  .fontWeight(FontWeight.Bold)
                  .fontColor('#303133');
                Text(item.desc)
                  .fontSize('13vp')
                  .fontColor('#909399');
              }
              .layoutWeight(1)
              .margin({ left: '16vp' })
              .alignItems(HorizontalAlign.Start);

              SymbolGlyph($r('sys.symbol.chevron_right'))
                .fontSize('20vp')
                .fontColor(['#C0C4CC']);
            }
            .width('100%')
            .padding('16vp')
            .backgroundColor('#ffffff')
            .borderRadius('12vp');
          })
        }
        .padding('16vp')
      }
      .layoutWeight(1);
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#f5f5f5');
  }
}
