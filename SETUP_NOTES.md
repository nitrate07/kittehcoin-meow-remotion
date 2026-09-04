# Ortam Kurulum Notları (Claude için hafıza — PC çökmesi/yeni makine senaryosu)

Bu dosya, bu proje için sandbox'ta (WSL2, root yok, apt-get kurulumu
kısıtlı) sıfırdan inşa edilen araç zincirinin tam dökümanıdır. Amaç:
yeni bir oturumda/makinede aynı şeyleri tekrar keşfetmek yerine
doğrudan bu adımları uygulamak.

**Hiçbir sırrı (token, client_secret) bu dosyaya veya repoya YAZMA.**
Sadece yollarını ve nasıl yeniden üretileceğini belirt.


## 1) Root'suz tam özellikli ffmpeg

Sandbox'ta `apt-get install ffmpeg` root gerektiriyor ve yok. Çözüm:
apt'ın .deb dosyalarını indirip elle bir sysroot'a çıkarmak.

```bash
mkdir -p ~/ffbuild/pkgs
cd ~/ffbuild/pkgs
apt-get install --reinstall -y --print-uris ffmpeg 2>/dev/null | grep -oP "(?<=')http[^']+" > ~/ffbuild/uris.txt
wget -q -i ~/ffbuild/uris.txt
mkdir -p ~/ffbuild/sysroot
for f in *.deb; do dpkg-deb -x "$f" ~/ffbuild/sysroot; done
```

Kullanmadan önce HER ZAMAN:
```bash
export LD_LIBRARY_PATH=~/ffbuild/sysroot/usr/lib/x86_64-linux-gnu:~/ffbuild/sysroot/usr/lib/x86_64-linux-gnu/pulseaudio
FF=~/ffbuild/sysroot/usr/bin/ffmpeg
FP=~/ffbuild/sysroot/usr/bin/ffprobe
```
(`pulseaudio` alt-dizini `libpulsecommon`'un dlopen ile aradığı yer —
LD_LIBRARY_PATH'e eklenmezse ses filtreleri patlar.)

Font: `~/ffbuild/chromedeps/extracted/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf`
(drawtext için).


## 2) Root'suz Playwright/Chromium sistem bağımlılıkları

Aynı apt-get-indirme tekniği, Chromium'un ihtiyaç duyduğu
`libnspr4`, `libnss3` vb. için:

```bash
mkdir -p ~/ffbuild/chromedeps
cd ~/ffbuild/chromedeps
apt-get install --reinstall -y --print-uris libnspr4 libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 libcairo2 libasound2 2>/dev/null | grep -oP "(?<=')http[^']+" > uris.txt
wget -q -i uris.txt
mkdir -p extracted
for f in *.deb; do dpkg-deb -x "$f" extracted; done
```

Kullanmadan önce:
```bash
export LD_LIBRARY_PATH=~/ffbuild/chromedeps/extracted/usr/lib/x86_64-linux-gnu:~/ffbuild/chromedeps/extracted/lib/x86_64-linux-gnu
```

Bu, hem Playwright hem de **Remotion'ın kendi headless-shell Chromium'u**
için gerekli (`remotion render`/`remotion still` komutlarından önce
mutlaka export et — yoksa `libnspr4.so: cannot open shared object`
hatası alırsın).


## 3) Python video araçları (uv ile, pip yok)

```bash
# uv zaten ~/.local/bin/uv altında kurulu olmalı, yoksa:
curl -LsSf https://astral.sh/uv/install.sh | sh

uv venv ~/videowork-venv
source ~/videowork-venv/bin/activate
uv pip install playwright pillow
playwright install chromium   # veya sistem chromium'unu chromedeps ile kullan
```

`record.py` deseni (deterministik, frame-accurate Playwright kaydı):
sayfaya `window.__teaser.setTime(t)` gibi bir global fonksiyon
expose et, `page.evaluate` ile frame frame ilerlet, gerçek zaman
akışına `time.sleep` ile senkronize et (webm süresi doğru çıksın diye).


## 4) Node.js / Remotion

```bash
node -v   # v22.22.1 bu makinede hazır geldi
npm -v    # 9.2.0
```

Proje: `~/remotion/kitteh-remotion` — manuel scaffold edildi (interactive
`create-video` wizard sandbox'ta stdin bekleyip donuyor, KULLANMA).
`package.json`:
```json
{
  "dependencies": {
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "remotion": "4.0.290",
    "@remotion/cli": "4.0.290"
  }
}
```
`npm install` sonrası çalıştırma:
```bash
export LD_LIBRARY_PATH=~/ffbuild/chromedeps/extracted/usr/lib/x86_64-linux-gnu:~/ffbuild/chromedeps/extracted/lib/x86_64-linux-gnu
cd ~/remotion/kitteh-remotion
npx remotion render <CompositionId> out/dosya.mp4 --props='{"key":"value"}'
npx remotion still <CompositionId> out/kare.png --frame=N
```

`src/index.js` → `registerRoot`, `src/Root.jsx` → tüm `<Composition>`
tanımları tek dosyada. Her senaryo kendi dosyasında
(Video.jsx=KittehTeaser, WoogiShort.jsx, MeowCard.jsx, MeowVault.jsx,
MeowSignal.jsx, MeowGiant.jsx).


## 5) YouTube API (WooGiGames kanalı)

Config: `~/.config/youtube-api/` içinde `client_secret.json` +
`token.json` (refresh token, ~7 gün ömürlü — test modunda). Kanal ID:
`UCQHMYxHzSEGWduD2sYQz4ug`. Yardımcı fonksiyonlar `~/ffbuild/yt_util.py`
(`refresh_token`, `upload_video`, `delete_video`, `list_channel_videos`).

Token ölmüşse: `~/.config/youtube-api/client_secret_desktop.json` ile
OAuth akışını yeniden başlat (tarayıcıda kullanıcı onayı gerekir).


## 6) GPU / WSL notu

`nvidia-smi` GPU'yu görüyor (GTX 1650) ama `/dev/dri` yok — Chrome
headless donanım hızlandırma kullanamıyor, otomatik CPU/software
render'a düşüyor. Bu render hızını sınırlıyor ama engellemez; ayrı bir
ayar gerekmiyor, olduğu gibi çalışıyor.


## 7) GitHub

`gh auth status` zaten `nitrate07` hesabıyla login (repo/workflow
scope'ları var). Yeni private repo + push:
```bash
cd ~/proje-klasoru
git init -q
git add -A && git commit -q -m "mesaj"
gh repo create <repo-adi> --private --source=. --remote=origin --push
```


## 8) Karşılaşılan ve çözülen bug'lar (tekrar düşmemek için)

- **`-ss` `-i`'den ÖNCE**: webm/vp8 ve hatta encode edilmiş h264 dosyalarda
  fast-seek yanlış keyframe'e düşebiliyor. QA için kare çekerken HER ZAMAN
  `-i dosya.mp4 -ss T` sırasıyla kullan (input sonrası, accurate seek),
  `-ss T -i dosya.mp4` değil.
- **Trim işlemi**: ffmpeg filter_complex içinde `trim=`/`atrim=` filtresi
  kullan, `-ss` ile input-seek yapma (aynı sebep).
- **`background-clip:text` + Remotion `render` (video) arasında ama
  `still` (tek kare) içinde YOK bir bug**: Remotion'ın video render'ı
  aynı browser sayfasını frame frame mutasyonla kullanıyor (hız için).
  Aynı DOM node'u farklı metin/gradient içerikle art arda güncellemek
  Chromium'da text-clip paint cache'ini bazen bozuyor (gradient text
  düz renkli bloğa dönüşüyor). ÇÖZÜM: React'te değişen içerik gösteren
  elementlere `key={uniqueId}` ver — React'i unmount/remount'a zorlar,
  stale paint state kalmaz.
- **`backface-visibility:hidden` + `transform-style:preserve-3d` AYNI
  elementte**: Chromium'da spin sırasında ters/mirror metin sızdırıyor.
  ÇÖZÜM: `preserve-3d`'yi SADECE 3D çocukları olan dış container'a koy,
  `backface-visibility:hidden`'ı SADECE flat ön/arka yüz elementlerine
  koy — asla ikisini birlikte aynı elemente verme.
- **₿ (U+20BF) glyph tofu/boş kutu**: sandbox fontlarında render olmuyor.
  Unicode karakter yerine el yapımı inline SVG path kullan.
- **192000Hz ses bozulması (amix)**: farklı kaynaklı ses girişlerini
  (lavfi + dosya) `amix` öncesi mutlaka `aresample=48000` ile aynı
  sample rate'e zorla, yoksa sample-rate negotiation çılgına dönüyor.
- **Remotion `create-video` interactive wizard**: stdin'i olmayan bir
  ortamda (bu sandbox) sonsuza kadar donar. Kullanma, manuel scaffold et.
- **Aynı içeriği 2 kez YouTube'a yükleme riski**: yeni bir render
  pipeline'ı eskisiyle PİKSEL AYNI çıktı üretiyorsa (görsel fark yok),
  kanala tekrar yüklemeden önce kullanıcıya sor — duplicate video kirliliği.


## 9) Önemli yol/isim notları

- Masaüstü (Türkçe Windows + OneDrive yönlendirmesi):
  `/mnt/c/Users/MBILISIM/OneDrive/Masaüstü/` (WSL'den) —
  `C:\Users\MBILISIM\OneDrive\Masaüstü\` (Windows'tan)
- Proje varlıkları ayrıca şurada da duruyor:
  `Masaüstü/meow/müzik/` (CapCut çıktıları — müzik, SFX, 2 hazır video,
  kittehcoin_audio_package.zip — TAM 29 parçalık ses seti)
- Downloads: `/mnt/c/Users/MBILISIM/Downloads/`
- Bu repo: `~/remotion/kitteh-remotion` = `github.com/nitrate07/kittehcoin-meow-remotion` (private)
