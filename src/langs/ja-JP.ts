/* eslint-disable sort-keys */
import stripIndent from "strip-indent";
import pluralize from "plur";

export const lang = {
    // Language Metadata
    META_ID: () => "ja-JP",

    // Commands

    // About Command
    COMMAND_ABOUT_META_DESCRIPTION: () => "このBotの情報を送信します。",
    COMMAND_ABOUT_EMBED_AUTHOR: (username: string) => `${username} - このBotはシンプルな音楽Botです。`,
    COMMAND_ABOUT_EMBED_DESCRIPTION: (
        channelCount: number, guildsCount: number, shardsCount: string, shardID: string, queueCount: number,
        platform: string, arch: string, osUptime: string, memoryRSS: string, memoryHeapTotal: string, memoryHeapUsed: string, processUptime: string, botUptime: string,
        nodejsVersion: string, discordjsVersion: string, ffmpegVersion: string, ytDlpVersion: string, OpusEncoder: string, botVersion: string
    ) => stripIndent(`
    \`\`\`asciidoc
    総チャンネル数       :: ${channelCount}
    総サーバー数         :: ${guildsCount}
    総シャード数         :: ${shardsCount}
    シャード ID          :: #${shardID}
    音楽再生中のサーバー  :: ${queueCount} サーバー
    プラットフォーム      :: ${platform}
    OSの稼働時間         :: ${osUptime}
    アーキテクチャ        :: ${arch}
    メモリ (RSS)         :: ${memoryRSS}
    メモリ (Heap Total)  :: ${memoryHeapTotal}
    メモリ (Heap Used)   :: ${memoryHeapUsed}
    プロセス稼働時間      :: ${processUptime}
    Botの稼働時間        :: ${botUptime}
    Node.js version     :: ${nodejsVersion}
    Discord.js version  :: ${discordjsVersion}
    FFmpeg version      :: ${ffmpegVersion}
    yt-dlp version      :: ${ytDlpVersion}
    Opus Encoder        :: ${OpusEncoder}
    Bot Version         :: ${botVersion}
    Source code         :: https://sh.hzmi.xyz/jukebox
    \`\`\`
    `),

    // Eval command
    COMMAND_EVAL_META_DESCRIPTION: () => "このコマンドはBotの所有者のみが使用可能です。",
    COMMAND_EVAL_META_ARGS: (index: number) => ["いくつかのjsコード"][index],
    COMMAND_EVAL_NO_PERM: () => "⚠️ このコマンドはBotの所有者のみに限定されています。",
    COMMAND_EVAL_NO_INPUT: () => "⚠️ jsコードが提供されていません。",
    COMMAND_EVAL_INPUT_FIELD_NAME: () => "入力",
    COMMAND_EVAL_OUTPUT_FIELD_NAME: () => "出力",
    COMMAND_EVAL_ERROR_FIELD_NAME: () => "エラー",

    // Help Command
    COMMAND_HELP_META_DESCRIPTION: () => "HELPを表示します。",
    COMMAND_HELP_META_ARGS: (index: number) => ["コマンドをここに入力"][index],
    COMMAND_HELP_EMBED_TITLE: () => "HELP",
    COMMAND_HELP_EMBED_FOOTER: (prefix: string) => `特定のコマンドの詳細情報を得るには ${prefix}help <command> を使ってください!`,
    COMMAND_HELP_EXTENDED_EMBED_TITLE: (name: string) => `${name}コマンドの情報`,
    COMMAND_HELP_EXTENDED_EMBED_CMD_NAME: () => "名称",
    COMMAND_HELP_EXTENDED_EMBED_CMD_DESC: () => "機能説明",
    COMMAND_HELP_EXTENDED_EMBED_CMD_ALIASES: () => "同じ機能を持つコマンド",
    COMMAND_HELP_EXTENDED_EMBED_CMD_USAGE: () => "使用方法",

    // Invite Command
    COMMAND_INVITE_META_DESCRIPTION: () => "このBotの招待リンクを送信します。",
    COMMAND_INVITE_EMBED_FIELD_NAME: () => "このDiscord Botの招待リンク",
    COMMAND_INVITE_EMBED_FIELD_VALUE: () => "ここを押してサーバーに追加!",

    // Now playing command
    COMMAND_NOWPLAYING_META_DESCRIPTION: () => "現在の再生している曲に関する情報を送信します。",
    COMMAND_NOWPLAYING_MESSAGE: () => "▶ 現在再生中:",
    COMMAND_NOWPLAYING_MESSAGE_PAUSED: () => "⏸ 現在再生中 (一時停止中):",
    COMMAND_NOWPLAYING_EMBED_FOOTER: (mode: string) => `繰り返しモード: ${mode}`,

    // Pause command
    COMMAND_PAUSE_META_DESCRIPTION: () => "現在再生中の音楽を一時停止します。",
    COMMAND_PAUSE_SUCCESS: () => "⏸ 再生中の音楽を一時停止しました。",
    COMMAND_PAUSE_ALREADY_PAUSED: () => "⚠️ 音楽はすでに一時停止しています。",

    // Ping command
    COMMAND_PING_META_DESCRIPTION: () => "Botの現在のPingを表示します。",
    COMMAND_PING_INITIAL_MESSAGE: () => "🏓 PING...",
    COMMAND_PING_RESULT_MESSAGE: () => "🏓 PONG!",
    COMMAND_PING_API_LATENCY: () => "📶 API Latency",
    COMMAND_PING_WS_LATENCY: () => "🌐 WebSocket Latency",
    COMMAND_PING_EMBED_FOOTER: (userTag: string) => `リクエスト: ${userTag}`,

    // Play command
    COMMAND_PLAY_META_DESCRIPTION: () => "音楽を再生します。",
    COMMAND_PLAY_META_ARGS: (index: number) => ["YouTube動画または再生リストのURL / YouTube動画名"][index],
    COMMAND_PLAY_ALREADY_PLAYING: (vcName: string) => `⚠️ 音楽はすでに**${vcName}**音声チャネルに再生されています。`,
    COMMAND_PLAY_INVALID_YOUTUBE_URL: () => "⚠️ 無効なYouTubeのURLです。",
    COMMAND_PLAY_INVALID_SOURCE: () => "⚠️ Jukeboxは現在、YouTubeのみをサポートしています。",
    COMMAND_PLAY_COULD_NOT_RESOLVE_RESOURCE: () => "⚠️ トラックリソースを解決できませんでした。",
    COMMAND_PLAY_RESOURCE_PROCESSING_ERR: (message: string) => `トラックリソースの処理中にエラーが発生しました。\n理由: \`${message}\``,
    COMMAND_PLAY_RESOURCE_NOT_FOUND: () => "[404] YouTube アイテムが見つかりません。",
    COMMAND_PLAY_TRACK_ADDED: (title: string, url: string) => `✅ **[${title}](${url})** がキューに追加されました。`,
    COMMAND_PLAY_ALREADY_QUEUED_TITLE: () => "既にキューに入っている、又は、重複しています。",
    COMMAND_PLAY_ALREADY_QUEUED_TITLE2: () => "重複したトラック",
    COMMAND_PLAY_ALREADY_QUEUED_MSG: (title: string, url: string, prefix: string) => stripIndent(
        `トラック **[${title}](${url})** は既にキューに入っており、このBot設定キュー内のトラックの重複を禁止しています。
        その代わりとして、\`${prefix}repeat\` を使ってください。`
    ),
    COMMAND_PLAY_ALREADY_QUEUED_MSG2: (count: number, prefix: string) => stripIndent(
        `${count} ${pluralize("track", count)} 以上のトラックは重複しているためスキップされ、このボットの設定では重複したトラックをキューに入れることはできません。
        その代わりとして、\`${prefix}repeat\` を使ってください。`
    ),
    COMMAND_PLAY_COULD_NOT_JOIN_VC: (message: string) => `エラーが発生しました。音声チャンネルに参加できませんでした\n理由: \`${message}\``,
    COMMAND_PLAY_YOUTUBE_PLAYLIST_NOT_FOUND: () => "⚠️ 再生リストが見つかりません",
    COMMAND_PLAY_YOUTUBE_PLAYLIST_EMPTY: () => "⚠️ 指定された再生リストが空です。",
    COMMAND_PLAY_YOUTUBE_RD_PLAYLIST_NOT_SUPPORTED: () => "⚠️ RD / YouTube mix再生リストはまだ対応していません。[ここのページ](https://github.com/Hazmi35/jukebox/issues/594)をご覧ください。",
    COMMAND_PLAY_YOUTUBE_PLAYLIST_ADDING_VIDEOS_FROM: (videoTitle: string, playlistTitle: string) => `トラック: ${videoTitle} から始まるすべてのトラックを追加する。再生リスト: ${playlistTitle}, 少々お待ちください...`,
    COMMAND_PLAY_YOUTUBE_PLAYLIST_ADDING_ALL_VIDEOS: (playlistTitle: string) => `再生リストの全曲を追加する。:${playlistTitle}, 少々お待ちください...`,
    COMMAND_PLAY_YOUTUBE_PLAYLIST_ADDING_FIRST_VIDEOS_ERR: (playlistTitle: string) => `⚠️ 再生リストの最初のビデオを追加できませんでした。 :${playlistTitle}`,
    COMMAND_PLAY_YOUTUBE_PLAYLIST_ADDING_REST_VIDEOS_ERR: (playlistTitle: string) => `⚠️ 再生リストの残りのビデオを追加することができませんでした: ${playlistTitle}`,
    COMMAND_PLAY_YOUTUBE_PLAYLIST_SUCCESS: (playlistTitle: string) => `再生リストの全トラックを表示します。再生リスト:${playlistTitle}のタイトル がキューに追加されました`,
    COMMAND_PLAY_YOUTUBE_PLAYLIST_SUCCESS2: (playlistTitle: string, videoTitle: string) => `トラック: ${videoTitle} から始まるすべてのトラック を再生リスト: ${playlistTitle}に追加します。再生リストのタイトル がキューに追加されました!`,
    COMMAND_PLAY_YOUTUBE_PLAYLIST_SUCCESS_FOOTER: (prefix: string) => `再生リストシャッフルモードが有効になっています。オフにするには "${prefix}shuffle disable" を使用してください。`,
    COMMAND_PLAY_YOUTUBE_PLAYLIST_LOAD_ERR: (message: string) => `再生リストを読み込めませんでした。\nエラー: \`${message}\``,
    COMMAND_PLAY_YOUTUBE_SEARCH_NO_RESULTS: () => "⚠️ 検索結果が表示できませんでした。",
    COMMAND_PLAY_YOUTUBE_SEARCH_RESULTS_EMBED_TITLE: () => "曲名選択",
    COMMAND_PLAY_YOUTUBE_SEARCH_RESULTS_CANCEL_MSG: () => "トラックの選択をキャンセルするには、`cancel` または `c` と入力してください。",
    COMMAND_PLAY_YOUTUBE_SEARCH_RESULTS_EMBED_FOOTER: (count: number) => `1-${count}の範囲で結果を選択してください。`,
    COMMAND_PLAY_YOUTUBE_SEARCH_CANCELED: () => "曲の選択をキャンセルしました。",
    COMMAND_PLAY_YOUTUBE_SEARCH_INVALID_INPUT: () => "値が入力されていないか無効です。",

    // Queue command
    COMMAND_QUEUE_META_DESCRIPTION: () => "現在のキューを表示します。",
    COMMAND_QUEUE_EMBED_TITLE: () => "Music Queue",
    COMMAND_QUEUE_EMBED_FOOTER: (title: string) => `現在再生中の曲: ${title}`,
    COMMAND_QUEUE_EMBED_PAGES_MSG: (current: number, total: number) => `${total}ページ中の${current}`,

    // Remove command
    COMMAND_REMOVE_META_DESCRIPTION: () => "現在のキューからトラックを削除します。",
    COMMAND_REMOVE_META_ARGS: (index: number) => ["トラック番号"][index],
    COMMAND_REMOVE_NOT_FOUND: (number: number) => `⚠️ トラック番号${number}が見つかりません。`,
    COMMAND_REMOVE_SUCCESS: (title: string, url: string) => `✅ **[${title}](${url}})**を削除しました。`,

    // Repeat command
    COMMAND_REPEAT_META_DESCRIPTION: () => "現在の曲またはキューをリピートします。",
    COMMAND_REPEAT_SUCCESS: (emoji: string, type: string) => `${emoji} 繰り返しモードは**${type}**です。`,

    // Resume command
    COMMAND_RESUME_META_DESCRIPTION: () => "一時停止された音楽を再開します。",
    COMMAND_RESUME_FAILED: () => "❗ 一時停止されていません！",
    COMMAND_RESUME_SUCCESS: () => "▶ 音楽再生を再開しました。",

    // Shuffle command
    COMMAND_SHUFFLE_META_DESCRIPTION: () => "音楽キューをシャッフルしたり、プレイリストシャッフルモードを切り替えたりできます。",
    COMMAND_SHUFFLE_SUCCESS: () => "🔀 キューをシャッフルしました！",
    COMMAND_SHUFFLE_MODE_SUCCESS: (state: boolean) => `🔀 プレイリストシャッフルモード:**${state ? "ENABLED" : "DISABLED"}**`,
    COMMAND_SHUFFLE_MODE_SUCCESS_FOOTER: () => `プレイリストシャッフルモードが有効な場合、新しく追加されたプレイリストはシャッフルされます。`,

    // Skip Command
    COMMAND_SKIP_META_DESCRIPTION: () => "現在の曲をスキップします。",
    COMMAND_SKIP_SUCCESS: (title: string, url: string) => `⏭ **[${title}](${url}})**をスキップしました。`,

    // Skip To Command
    COMMAND_SKIPTO_META_DESCRIPTION: () => "現在の曲の曲を停止し、指定したトラックまでスキップします。",
    COMMAND_SKIPTO_META_ARGS: (index: number) => ["トラック番号"][index],
    COMMAND_SKIPTO_NOT_FOUND: (number: number) => `⚠️ トラック番号 ${number} は見つかりませんでした。`,
    COMMAND_SKIPTO_FAIL: () => "⚠️ トラックにスキップすることができませんでした。",
    COMMAND_SKIPTO_SUCCESS: (title: string, url: string, count: number) => `⏭ **[${title}](${url}})**までスキップ、${count} ${pluralize("track", count)}をスキップしました。`,

    // Stop command
    COMMAND_STOP_META_DESCRIPTION: () => "再生している音楽を完全に停止します。",
    COMMAND_STOP_SUCCESS: () => "⏹ 再生を終了しました。",

    // Volume command
    COMMAND_VOLUME_META_DESCRIPTION: () => "音楽プレーヤーの音量を表示・変更します。",
    COMMAND_VOLUME_META_ARGS: (index: number) => ["音量"][index],
    COMMAND_VOLUME_DISABLED: () => "⚠ このボット構成では、ボリュームコマンドは無効になっています。Discordクライアントのボリューム機能を各自で使用してください。",
    COMMAND_VOLUME_CURRENT: (volume: number) => `📶 現在のボリュームは\`${volume}\`です。`,
    COMMAND_VOLUME_USE_PAUSE_INSTEAD: () => "❗ 音量を\`0\`に設定する代わりに、音楽プレーヤーを一時停止してください",
    COMMAND_VOLUME_OVER_LIMIT: (max: number) => `❗ \`${max}\`を超える音量を設定できません`,
    COMMAND_VOLUME_SET: (volume: number) => `📶 \`${volume}\`に音量を設定しました。`,

    // MessageEvent
    MESSAGE_EVENT_ON_MENTION: (prefix: string) => `こんにちは！私はシンプルなな音楽Botです、私のコマンドを見るには \`${prefix}help\`を使用してください！`,

    // VoiceStateUpdateEvent
    BOT_DISCONNECTED_FROM_VOICE: () => "音声チャンネルから切断されたため、キューを削除しました。",
    MUSIC_DELETEQUEUETIMEOUT_WAS_DELETED: (duration: number) => `**${duration}** が経過し、私の音声チャネルに人がいなかったため、キューは削除されました。`,
    MUSIC_DELETEQUEUETIMEOUT_EMBED_TITLE: () => `⏹ キューを削除しました。`,
    MUSIC_DELETEQUEUETIMEOUT_PAUSED: (duration: number) => stripIndent(`
        私の音声チャネルから皆が去ってしまったので、リソースを節約するために、キューは一時停止されました。
        **${duration}**の間に私の音声チャンネルに参加する人がいなければ、キューは削除されます。
    `),
    MUSIC_DELETEQUEUETIMEOUT_PAUSED_EMBED_TITLE: () => "⏸ キューが一時停止しました。",
    MUSIC_DELETEQUEUETIMEOUT_RESUMED: (title: string, url: string) => `ボイスチャンネルに誰かが参加する。音楽を楽しもう🎶現在再生中: **[${title}](${url})**`,
    MUSIC_DELETEQUEUETIMEOUT_RESUMED_EMBED_TITLE: () => "▶ 再生を再開しました",

    // Command Handler
    COMMAND_TIMEOUT: (username: string, timeLeft: string) => `**${username}**, **${timeLeft}**秒後に再度コマンドを実行してください！クールダウン中です！`,

    // Music Queue System
    MUSIC_QUEUE_START_PLAYING: (title: string, url: string) => `▶ 再生開始: **[${title}](${url})**`,
    MUSIC_QUEUE_STOP_PLAYING: (title: string, url: string) => `⏹ 再生停止: **[${title}](${url})**`,
    MUSIC_QUEUE_FINISHED: (prefix: string) => `⏹ キューが終了しました さらに音楽を再生するには、"${prefix}play"を使用します。`,
    MUSIC_QUEUE_ERROR_WHILE_PLAYING: (message: string) => `音楽再生時のエラー\n理由: \`${message}\``,
    MUSIC_VOICE_HANDLER_COULDNT_ESTABLISH: () => "15秒以内に音声接続を確立できませんでした。",

    // Decorators
    // Music helpers
    MUSIC_HELPER_QUEUE_DOES_NOT_EXISTS: () => "何も再生されていません。",
    MUSIC_HELPER_NEED_TO_BE_ON_THE_SAME_VC: () => "私と同じ音声チャンネルに接続している必要があります！接続してからコマンドを実行してください！",
    MUSIC_HELPER_USER_NOT_IN_VC: () => "申し訳ございませんが、音声チャンネルでなければ接続できません！",
    MUSIC_HELPER_BOT_CANT_CONNECT: () => "申し訳ございませんが、音声チャンネルに接続することができませんでした。",
    MUSIC_HELPER_BOT_CANT_SPEAK: () => "申し訳ありませんが、その音声チャンネルで再生する権限がないようなので、権限を付与してから再度コマンドを実行してください。",

    // Misc
    MUSIC_REPEAT_MODE_TYPES: (index: number) => ["disabled", "current track", "all tracks in the queue"][index],
    MUSIC_REPEAT_MODE_EMOJIS: (index: number) => ["▶", "🔂", "🔁"][index],
    COMMAND_INVALID_ARGS: (prefix: string, cmd: string) => `⚠️ 無効な引数です。,詳細については\`${prefix}help ${cmd}\`と入力して確認してください。`,
    NOT_AVAILABLE: () => "N/A"
};
