import { getCodeImg, getInfo, login } from '../api/login';
import { INDEX_ROUTE } from '../constants/RouteConstants';
import type { LoginRequest } from '../api/login';

interface RouteParams {
  url: string;
}

@Entry
@Component
struct Login {
  @State username: string = '';
  @State password: string = '';
  @State code: string = '';
  @State uuid: string = '';
  @State captchaEnabled: boolean = true;
  @State codeImage: string = '';
  @State loading: boolean = false;
  @State errorMessage: string | Resource = '';

  aboutToAppear(): void {
    this.errorMessage = '';
    this.loadCaptcha();
  }

  private canSubmit(): boolean {
    if (this.loading) {
      return false;
    }
    if (!this.username.trim() || !this.password) {
      return false;
    }
    if (this.captchaEnabled && !this.code.trim()) {
      return false;
    }
    return true;
  }

  private async loadCaptcha(): Promise<void> {
    console.info('Login: loading captcha...');
    try {
      const result = await getCodeImg();
      console.info('Login: captcha result received, uuid=' + result.uuid);
      this.captchaEnabled = result.captchaEnabled !== false;
      this.uuid = result.uuid ?? '';
      if (this.captchaEnabled && result.img) {
        this.codeImage = `data:image/jpeg;base64,${result.img}`;
        console.info('Login: codeImage set');
      } else {
        this.codeImage = '';
        console.warn('Login: captchaEnabled is false or img is missing');
      }
    } catch (error) {
      console.error('Login: loadCaptcha failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      // 验证码加载失败时不显示全局错误，避免初次进入页面就报错
      this.codeImage = '';
    }
  }

  private async handleLogin(): Promise<void> {
    if (!this.username.trim()) {
      this.errorMessage = $r('app.string.login_error_username');
      return;
    }
    if (!this.password) {
      this.errorMessage = $r('app.string.login_error_password');
      return;
    }
    if (this.captchaEnabled && !this.code.trim()) {
      this.errorMessage = $r('app.string.login_error_captcha');
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    try {
      const payload: LoginRequest = {
        username: this.username.trim(),
        password: this.password,
        code: this.code.trim(),
        uuid: this.uuid
      };
      const loginResult = await login(payload);
      const token = loginResult.token ?? '';
      if (!token) {
        throw new Error('TOKEN_EMPTY');
      }
      const userInfo = await getInfo(token);
      // 保存到 AppStorage 实现全局状态共享
      AppStorage.setOrCreate('token', token);
      AppStorage.setOrCreate('user', userInfo.user);
      AppStorage.setOrCreate('roles', userInfo.roles);
      AppStorage.setOrCreate('permissions', userInfo.permissions);

      const routeParams: RouteParams = {
        url: INDEX_ROUTE
      };
      this.getUIContext()
        .getRouter()
        .replaceUrl(routeParams)
        .catch(() => {
          // ignore navigation failure
        });
    } catch (error) {
      if (error instanceof Error && error.message === 'TOKEN_EMPTY') {
        this.errorMessage = $r('app.string.login_error_token');
      } else if (error instanceof Error) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = $r('app.string.login_error_generic');
      }
      if (this.captchaEnabled) {
        this.code = '';
        this.loadCaptcha();
      }
    } finally {
      this.loading = false;
    }
  }

  build(): void {
    Column() {
      Scroll() {
        Column() {
          // Header 区域（绿色背景，居中标题）
          Column({ space: 6 }) {
            Text($r('app.string.login_title'))
              .fontSize('26vp')
              .fontWeight(FontWeight.Medium)
              .fontColor('#ffffff');
            Text($r('app.string.login_subtitle'))
              .fontSize('15vp')
              .fontColor('#e8f5e9');
          }
          .width('100%')
          .padding({ top: '64vp', bottom: '48vp', left: '24vp', right: '24vp' })
          .backgroundColor('#67C23A');

          // 表单卡片区域
          Column({ space: 18 }) {
            Column({ space: 12 }) {
              TextInput({ placeholder: $r('app.string.login_username_placeholder') })
                .width('100%')
                .height('48vp')
                .borderRadius('10vp')
                .padding({ left: '16vp', right: '16vp' })
                .backgroundColor('#f5f5f5')
                .fontSize('16vp')
                .onChange((value: string) => {
                  this.username = value;
                });

              TextInput({ placeholder: $r('app.string.login_password_placeholder') })
                .type(InputType.Password)
                .width('100%')
                .height('48vp')
                .borderRadius('10vp')
                .padding({ left: '16vp', right: '16vp' })
                .backgroundColor('#f5f5f5')
                .fontSize('16vp')
                .onChange((value: string) => {
                  this.password = value;
                });

              if (this.captchaEnabled) {
                Row() {
                  TextInput({ placeholder: $r('app.string.login_captcha_placeholder') })
                    .layoutWeight(1)
                    .height('48vp')
                    .borderRadius('10vp')
                    .padding({ left: '16vp', right: '16vp' })
                    .backgroundColor('#f5f5f5')
                    .fontSize('16vp')
                    .onChange((value: string) => {
                      this.code = value;
                    });
                  Stack() {
                    if (this.codeImage) {
                      Image(this.codeImage)
                        .width('110vp')
                        .height('48vp')
                        .borderRadius('10vp')
                        .onClick(() => this.loadCaptcha());
                    } else {
                      Text($r('app.string.login_refresh_code'))
                        .fontSize('12vp')
                        .fontColor($r('sys.color.ohos_id_color_text_secondary'))
                        .onClick(() => this.loadCaptcha());
                    }
                  }
                  .width('110vp')
                  .height('48vp')
                  .margin({ left: '8vp' });
                }
                .width('100%');
              }
            }
            .width('100%');

            if (this.errorMessage) {
              Text(this.errorMessage)
                .fontSize('12vp')
                .fontColor('#FF4D4F')
                .width('100%');
            }

            Button(this.loading ? $r('app.string.login_button_loading') : $r('app.string.login_button'))
              .width('100%')
              .height('50vp')
              .borderRadius('25vp')
              .backgroundColor(this.canSubmit() ? '#67C23A' : '#bfbfbf')
              .fontColor('#FFFFFF')
              .enabled(this.canSubmit())
              .onClick(() => this.handleLogin());

            Text($r('app.string.login_agreement_tip'))
              .fontSize('12vp')
              .fontColor($r('sys.color.ohos_id_color_text_secondary'))
              .lineHeight('18vp')
              .width('100%')
              .textAlign(TextAlign.Center);
          }
          .padding({ left: '24vp', right: '24vp', top: '28vp', bottom: '28vp' })
          .backgroundColor('#ffffff')
          .borderRadius('20vp')
          .width('100%')
          .margin({ left: '16vp', right: '16vp', top: '-24vp', bottom: '24vp' });
        }
        .width('100%')
        .backgroundColor('#f5f5f5');
      }
      .width('100%')
      .height('100%')
      .scrollBar(BarState.Off);
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#67C23A'); // 设置最外层背景为绿色，消除顶部白边
  }
}
