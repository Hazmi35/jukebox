/* eslint-disable max-len, @typescript-eslint/naming-convention */
import stripIndent from "strip-indent";
import pluralize from "plur";
import { IAboutCommandData } from "../typings";

export const lang = {
    // Language Metadata
    META_ID: () => "tr-TR",

    // Commands

    // About Command
    COMMAND_ABOUT_META_DESCRIPTION: () => "Botun bilgilerini gönder",
    COMMAND_ABOUT_EMBED_AUTHOR: (username: string) => `${username} - Basit bir müzik botu.`,
    COMMAND_ABOUT_EMBED_DESCRIPTION: (data: IAboutCommandData) => stripIndent(`
    \`\`\`asciidoc
    Kanal sayısı        :: ${data.stats.channelCount}
    Sunucu sayısı       :: ${data.stats.guildsCount}
    Parça sayısı        :: ${data.shard.count}
    Parça ID            :: #${data.shard.id}
    Müzik çalınan       :: ${data.stats.playersCount} sunucu

    Platform            :: ${data.bot.platform}
    OS Çalışma süresi   :: ${data.stats.uptimes.os}
    Mimari              :: ${data.bot.arch}
    Bellek (RSS)        :: ${data.stats.memory.rss}
    Bellek (Heap Total) :: ${data.stats.memory.heapTotal}
    Bellek (Heap Used)  :: ${data.stats.memory.heapUsed}
    Çalışma süresi      :: ${data.stats.uptimes.process}
    Bot Çalışma süresi  :: ${data.stats.uptimes.bot}

    Node.js version     :: ${data.bot.versions.nodejs}
    Discord.js version  :: ${data.bot.versions.discordjs}
    FFmpeg version      :: ${data.bot.versions.ffmpeg}
    yt-dlp version      :: ${data.bot.versions.ytdlp}
    Opus Encoder        :: ${data.bot.opusEncoder}
    Bot Version         :: ${data.bot.versions.bot}

    Source code         :: https://sh.hzmi.xyz/jukebox
    \`\`\`
    `),

    // Eval command
    COMMAND_EVAL_META_DESCRIPTION: () => "Sadece bot sahibi bu komutu kullanabilir",
    COMMAND_EVAL_META_ARGS: (index: number) => ["Js kodu"][index],
    COMMAND_EVAL_NO_PERM: () => "⚠️ Bu komut bot sahipi ile sınırlandırıldı",
    COMMAND_EVAL_NO_INPUT: () => "⚠️ js kodu sağlanamadı",
    COMMAND_EVAL_INPUT_FIELD_NAME: () => "Giriş",
    COMMAND_EVAL_OUTPUT_FIELD_NAME: () => "Çıkış",
    COMMAND_EVAL_ERROR_FIELD_NAME: () => "Hata",

    // Help Command
    COMMAND_HELP_META_DESCRIPTION: () => "Yardım menüsünü gösterir",
    COMMAND_HELP_META_ARGS: (index: number) => ["Komut ismi"][index],
    COMMAND_HELP_EMBED_TITLE: () => "Yardım menüsü",
    COMMAND_HELP_EMBED_FOOTER: (prefix: string) => `Belirli bir komut hakkında daha fazla bilgi almak için ${prefix}help <command> kullanın!`,
    COMMAND_HELP_EXTENDED_EMBED_TITLE: (name: string) => `${name} Komutu hakkında bilgiler`,
    COMMAND_HELP_EXTENDED_EMBED_CMD_NAME: () => "İsim",
    COMMAND_HELP_EXTENDED_EMBED_CMD_DESC: () => "Açıklama",
    COMMAND_HELP_EXTENDED_EMBED_CMD_ALIASES: () => "Kısaltmalar",
    COMMAND_HELP_EXTENDED_EMBED_CMD_USAGE: () => "Kullanım",

    // Invite Command
    COMMAND_INVITE_META_DESCRIPTION: () => "Botun davet bağlantısını gönder",
    COMMAND_INVITE_EMBED_FIELD_NAME: () => "Discord bot davet linki",
    COMMAND_INVITE_EMBED_FIELD_VALUE: () => "Buraya tıkla",

    // Now playing command
    COMMAND_NOWPLAYING_META_DESCRIPTION: () => "Mevcut müzik çalar hakkında bilgi gönder",
    COMMAND_NOWPLAYING_MESSAGE: () => "▶ Şimdi çalınan:",
    COMMAND_NOWPLAYING_MESSAGE_PAUSED: () => "⏸ Şimdi çalınan (duraklatıldı):",
    COMMAND_NOWPLAYING_EMBED_FOOTER: (mode: string) => `Tekrarlama modu: ${mode}`,

    // Pause command
    COMMAND_PAUSE_META_DESCRIPTION: () => "Müzik çaları duraklat",
    COMMAND_PAUSE_SUCCESS: () => "⏸ Müzik çalar duraklatıldı",
    COMMAND_PAUSE_ALREADY_PAUSED: () => "⚠️ Müzik çalar zaten duraklatıldı!",

    // Ping command
    COMMAND_PING_META_DESCRIPTION: () => "Bot'un mevcut pingini gösterir.",
    COMMAND_PING_INITIAL_MESSAGE: () => "🏓 PING...",
    COMMAND_PING_RESULT_MESSAGE: () => "🏓 PONG!",
    COMMAND_PING_API_LATENCY: () => "📶 API Latency",
    COMMAND_PING_WS_LATENCY: () => "🌐 WebSocket Latency",
    COMMAND_PING_EMBED_FOOTER: (userTag: string) => `${userTag} :Tarafından istenildi`,

    // Play command
    COMMAND_PLAY_META_DESCRIPTION: () => "Müzik çal",
    COMMAND_PLAY_META_ARGS: (index: number) => ["YouTube videosu veya oynatma listesi URL'si / YouTube video adı"][index],
    COMMAND_PLAY_ALREADY_PLAYING: (vcName: string) => `⚠️ Müzik çalar zaten **${vcName}** ses kanalında çalıyor`,
    COMMAND_PLAY_INVALID_YOUTUBE_URL: () => "⚠️ Geçersiz YouTube URL'si",
    COMMAND_PLAY_INVALID_SOURCE: () => "⚠️ Jukebox şu anda yalnızca YouTube'u kaynak olarak desteklemektedir.",
    COMMAND_PLAY_COULD_NOT_RESOLVE_RESOURCE: () => "⚠️ Parça kaynağı çözülemedi",
    COMMAND_PLAY_RESOURCE_PROCESSING_ERR: (message: string) => `Parça kaynağı çözümlenirken hata oluştu\nSebep: \`${message}\``,
    COMMAND_PLAY_RESOURCE_NOT_FOUND: () => "[404] Youtube öğesi bulunamadı.",
    COMMAND_PLAY_TRACK_ADDED: (title: string, url: string) => `✅ **[${title}](${url})** Parçası sıraya eklendi`,
    COMMAND_PLAY_ALREADY_QUEUED_TITLE: () => "Zaten kuyruğa alındı / çoğaltıldı",
    COMMAND_PLAY_ALREADY_QUEUED_TITLE2: () => "Yinelenen parçalar",
    COMMAND_PLAY_ALREADY_QUEUED_MSG: (title: string, url: string, prefix: string) => stripIndent(
        `**[${title}](${url})** Parçası sıraya zaten alındı ve bu bot yapılandırması kuyrukta yinelenen parçalara izin vermiyor.
        Lütfen bunun yerine \`${prefix}repeat\` kullanın`
    ),
    COMMAND_PLAY_ALREADY_QUEUED_MSG2: (count: number, prefix: string) => stripIndent(
        `${count} ${pluralize("track", count)} Kopyası olduğu için atlandı ve bu bot yapılandırması kuyrukta yinelenen parçalara izin vermiyor.
        Lütfen bunun yerine \`${prefix}repeat\` kullanın`
    ),
    COMMAND_PLAY_COULD_NOT_JOIN_VC: (message: string) => `Hata: Ses kanalına bağlanılamıyor!\nSebep: \`${message}\``,
    COMMAND_PLAY_YOUTUBE_PLAYLIST_NOT_FOUND: () => "⚠️ Çalma listesi bulunamadı",
    COMMAND_PLAY_YOUTUBE_PLAYLIST_EMPTY: () => "⚠️ Belirtilen oynatma listesi boş.",
    COMMAND_PLAY_YOUTUBE_RD_PLAYLIST_NOT_SUPPORTED: () => "⚠️ RD / YouTube mix oynatma listesi henüz desteklenmiyor. Lütfen [bu soruna] bakın(https://github.com/Hazmi35/jukebox/issues/594)",
    COMMAND_PLAY_YOUTUBE_PLAYLIST_ADDING_VIDEOS_FROM: (videoTitle: string, playlistTitle: string) => `Şu parçadan başlayan tüm parçalar: ${videoTitle} oynatma listesine ekleniyor: ${playlistTitle}, Bekle...`,
    COMMAND_PLAY_YOUTUBE_PLAYLIST_ADDING_ALL_VIDEOS: (playlistTitle: string) => `Oynatma listesine tüm parçalar ekleniyor: ${playlistTitle}, bekle...`,
    COMMAND_PLAY_YOUTUBE_PLAYLIST_ADDING_FIRST_VIDEOS_ERR: (playlistTitle: string) => `⚠️ Oynatma listesinin ilk videosu eklenemedi: ${playlistTitle}`,
    COMMAND_PLAY_YOUTUBE_PLAYLIST_ADDING_REST_VIDEOS_ERR: (playlistTitle: string) => `⚠️ Oynatma listesinin geri kalan videoları eklenemedi: ${playlistTitle}`,
    COMMAND_PLAY_YOUTUBE_PLAYLIST_SUCCESS: (playlistTitle: string) => `Oynatma listesindeki tüm parçalar: ${playlistTitle} sıraya eklendi!`,
    COMMAND_PLAY_YOUTUBE_PLAYLIST_SUCCESS2: (playlistTitle: string, videoTitle: string) => `Şu parçadan paşlayan tüm parçalar: ${videoTitle} Çalma listesindeki: ${playlistTitle} sıraya eklendi!`,
    COMMAND_PLAY_YOUTUBE_PLAYLIST_SUCCESS_FOOTER: (prefix: string) => `Çalma Listesi Karıştırma modu etkinleştirildi. Kapatmak için "${prefix}shuffle disable" seçeneğini kullanın`,
    COMMAND_PLAY_YOUTUBE_PLAYLIST_LOAD_ERR: (message: string) => `Çalma listesini yükleyemedim!\nHata: \`${message}\``,
    COMMAND_PLAY_YOUTUBE_SEARCH_NO_RESULTS: () => "⚠️ Herhangi bir arama sonucu alamadım!",
    COMMAND_PLAY_YOUTUBE_SEARCH_RESULTS_EMBED_TITLE: () => "Parça seçimi",
    COMMAND_PLAY_YOUTUBE_SEARCH_RESULTS_CANCEL_MSG: () => "Parça seçimini iptal etmek için 'cancel' veya 'c' yazın",
    COMMAND_PLAY_YOUTUBE_SEARCH_RESULTS_EMBED_FOOTER: (count: number) => `Lütfen 1-${count} arasında değişen sonuçlardan birini seçin`,
    COMMAND_PLAY_YOUTUBE_SEARCH_CANCELED: () => "Parça seçimi iptal edildi.",
    COMMAND_PLAY_YOUTUBE_SEARCH_INVALID_INPUT: () => "Hiç veya geçersiz değer girildi, parça seçimi iptal edildi.",

    // Queue command
    COMMAND_QUEUE_META_DESCRIPTION: () => "Geçerli kuyruğu göster",
    COMMAND_QUEUE_EMBED_TITLE: () => "Muzik sırası",
    COMMAND_QUEUE_EMBED_FOOTER: (title: string) => `Şimdi çalınan: ${title}`,
    COMMAND_QUEUE_EMBED_PAGES_MSG: (current: number, total: number) => `${total} Sayfadan ${current} numaralı sayfayı kullanıyorsun`,

    // Remove command
    COMMAND_REMOVE_META_DESCRIPTION: () => "Geçerli kuyruktan bir parçayı kaldır",
    COMMAND_REMOVE_META_ARGS: (index: number) => ["Parça numarası"][index],
    COMMAND_REMOVE_NOT_FOUND: (number: number) => `⚠️ Parça numarası ${number} Bulunamadı.`,
    COMMAND_REMOVE_SUCCESS: (title: string, url: string) => `✅ **[${title}](${url}})** Kaldırıldı`,

    // Repeat command
    COMMAND_REPEAT_META_DESCRIPTION: () => "Geçerli parçayı veya sırayı tekrarla",
    COMMAND_REPEAT_SUCCESS: (emoji: string, type: string) => `${emoji} Tekrarlanıyor **${type}**`,

    // Resume command
    COMMAND_RESUME_META_DESCRIPTION: () => "Müzik çaları devam ettir",
    COMMAND_RESUME_FAILED: () => "❗ Müzik çalar duraklatılmadı!",
    COMMAND_RESUME_SUCCESS: () => "▶ Müzik çalar devam ettirildi",

    // Shuffle command
    COMMAND_SHUFFLE_META_DESCRIPTION: () => "Müzik sırasını karıştır veya çalma listeleri için karıştırma modunu değiştir",
    COMMAND_SHUFFLE_SUCCESS: () => "🔀 Sıra karıştırıldı!",
    COMMAND_SHUFFLE_MODE_SUCCESS: (state: boolean) => `🔀 Oynatma listesi karıştırma modu: **${state ? "AÇIK" : "KAPALI"}**`,
    COMMAND_SHUFFLE_MODE_SUCCESS_FOOTER: () => "Çalma listesi karıştırma modu etkinleştirildiğinde, yeni eklenen çalma listeleri karıştırılacaktır.",

    // Skip Command
    COMMAND_SKIP_META_DESCRIPTION: () => "Geçerli müziği atla",
    COMMAND_SKIP_SUCCESS: (title: string, url: string) => `⏭ **[${title}](${url}})** Atlandı`,

    // Skip To Command
    COMMAND_SKIPTO_META_DESCRIPTION: () => "Geçerli parçayı belirli bir parçaya atla",
    COMMAND_SKIPTO_META_ARGS: (index: number) => ["Parça numarası"][index],
    COMMAND_SKIPTO_NOT_FOUND: (number: number) => `⚠️ Parça numarası ${number} bulunamadı.`,
    COMMAND_SKIPTO_FAIL: () => "⚠️ Geçerli parçaya geçilemedi",
    COMMAND_SKIPTO_SUCCESS: (title: string, url: string, count: number) => `⏭ **[${title}](${url}})** Parçasına atlandı, ${count} ${pluralize("track", count)} atlandı`,

    // Stop command
    COMMAND_STOP_META_DESCRIPTION: () => "Müzik sırasını durdur",
    COMMAND_STOP_SUCCESS: () => "⏹ Sıra durduruldu.",

    // Volume command
    COMMAND_VOLUME_META_DESCRIPTION: () => "Müzik çaların sesini göster veya değiştir",
    COMMAND_VOLUME_META_ARGS: (index: number) => ["Yeni ses düzeyi"][index],
    COMMAND_VOLUME_DISABLED: () => "⚠ Bu bot yapılandırmasında ses komutu devre dışı bırakıldı. Lütfen doğrudan Discord istemcisindeki ses işlevini kullanın",
    COMMAND_VOLUME_CURRENT: (volume: number) => `📶 Mevcut ses düzeyi \`${volume}\``,
    COMMAND_VOLUME_USE_PAUSE_INSTEAD: () => "❗ Sesi `0`a ayarlamak yerine müzik çaları duraklatın",
    COMMAND_VOLUME_OVER_LIMIT: (max: number) => `❗ Verilen ses düzeyini ayarlınamıyor \`${max}\``,
    COMMAND_VOLUME_SET: (volume: number) => `📶 Ses düzeyi \`${volume}\` olarak ayarlandı`,

    // MessageEvent
    MESSAGE_EVENT_ON_MENTION: (prefix: string) => `Merhaba, ben basit bir müzik botuyum, komutlarıma bakmak için \`${prefix}help\` komutunu kullanın`,

    // VoiceStateUpdateEvent
    BOT_DISCONNECTED_FROM_VOICE: () => "Ses kanalıyla bağlantım kesildi, sıra silinecek",
    MUSIC_DELETEQUEUETIMEOUT_WAS_DELETED: (duration: string) => `**${duration}** geçti ve ses kanalıma katılan kimse yok, sıra silindi.`,
    MUSIC_DELETEQUEUETIMEOUT_EMBED_TITLE: () => "⏹ Sıra silindi.",
    MUSIC_DELETEQUEUETIMEOUT_PAUSED: (duration: string) => stripIndent(`
        Herkes ses kanalımdan ayrıldı, kaynakları kurtarmak için sıra duraklatıldı.
        Sonraki **${duration}** içinde ses kanalıma kimse katılmazsa, sıra silinecek.
    `),
    MUSIC_DELETEQUEUETIMEOUT_PAUSED_EMBED_TITLE: () => "⏸ Sıra duraklatıldı.",
    MUSIC_DELETEQUEUETIMEOUT_RESUMED: (title: string, url: string) => `Ses kanalına biri katıldı. Müziğin tadını çıkarın 🎶\nŞimdi Çalınan: **[${title}](${url})**`,
    MUSIC_DELETEQUEUETIMEOUT_RESUMED_EMBED_TITLE: () => "▶ Sıra devam ettirildi",

    // Command Handler
    COMMAND_TIMEOUT: (username: string, timeLeft: string) => `**${username}**, lütfen **${timeLeft}** süresini bekle!`,

    // Music Queue System
    MUSIC_QUEUE_START_PLAYING: (title: string, url: string) => `▶ Çalmaya başlandı: **[${title}](${url})**`,
    MUSIC_QUEUE_STOP_PLAYING: (title: string, url: string) => `⏹ Çalma durduruldu: **[${title}](${url})**`,
    MUSIC_QUEUE_FINISHED: (prefix: string) => `⏹ Sıra tamamlandı! Daha fazla müzik çalmak için "${prefix}play" seçeneğini kullanın`,
    MUSIC_QUEUE_ERROR_WHILE_PLAYING: (message: string) => `Müzik çalmaya çalışırken hata oluştu\nSebep: \`${message}\``,
    MUSIC_VOICE_HANDLER_COULDNT_ESTABLISH: () => "15 saniye içinde sesli bağlantı kurulamadı.",

    // Decorators

    // Music helpers
    MUSIC_HELPER_QUEUE_DOES_NOT_EXISTS: () => "Çalan bir şey yok.",
    MUSIC_HELPER_NEED_TO_BE_ON_THE_SAME_VC: () => "Bulunduğum ses kanalında olmalısın",
    MUSIC_HELPER_USER_NOT_IN_VC: () => "Üzgünüm, ama bunu yapmak için bir ses kanalında olmanız gerekiyor",
    MUSIC_HELPER_BOT_CANT_CONNECT: () => "Üzgünüm ama ses kanalınıza bağlanamıyorum, uygun izinlere sahip olduğumdan emin olun!",
    MUSIC_HELPER_BOT_CANT_SPEAK: () => "Üzgünüm ama o ses kanalında konuşamam. uygun izinlere sahip olduğumdan emin ol!",

    // Misc
    MUSIC_REPEAT_MODE_TYPES: (index: number) => ["devre dışı", "geçerli parça", "sıradaki tüm parçalar"][index],
    MUSIC_REPEAT_MODE_EMOJIS: (index: number) => ["▶", "🔂", "🔁"][index],
    COMMAND_INVALID_ARGS: (prefix: string, cmd: string) => `⚠️ Geçersiz bağımsız değişken, daha fazla bilgi için \`${prefix}help ${cmd}\` yazın`,
    NOT_AVAILABLE: () => "N/A"
};
