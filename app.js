// ============================================================================
// BOKITCORD CLIENT APPLICATION
// ============================================================================

(function () {
  'use strict';

  // Application State
  const state = {
    token: localStorage.getItem('bokitcord_token') || null,
    user: null,
    channels: [],
    currentChannelId: 'general',
    currentView: 'channels', // 'channels' | 'friends' | 'dm'
    friendsTab: 'online', // 'online' | 'all' | 'pending' | 'add'
    socket: null,
    users: [],
    requests: [],
    friends: [],
    openDms: [],
    currentDmRecipient: null,
    unreadDms: new Set(),
    unreadDmCounts: {},
    activeProfileUser: null,
    activeAdminTab: 'pending',
    rejectingRequestId: null,
    embedDraft: {
      color: '#5865F2',
      title: '',
      url: '',
      description: '',
      author: '',
      footer: '',
      imageUrl: '',
      thumbnailUrl: '',
      fields: [],
    },
    stagedImage: null,
    nameChangeStatus: null,
  };

  // DOM Elements Cache
  const el = {
    globalTopNavbar: document.getElementById('global-top-navbar'),
    navTabChat: document.getElementById('nav-tab-chat'),
    chatTabBadge: document.getElementById('chat-tab-badge'),
    navTabProxy: document.getElementById('nav-tab-proxy'),
    navTabUpdates: document.getElementById('nav-tab-updates'),
    navTabEditor: document.getElementById('nav-tab-editor'),
    navTabGames: document.getElementById('nav-tab-games'),
    navTabMovies: document.getElementById('nav-tab-movies'),
    navbarWispStat: document.getElementById('navbar-wisp-stat'),
    navbarUserChip: document.getElementById('navbar-user-chip'),
    navbarUserAvatar: document.getElementById('navbar-user-avatar'),
    navbarUserName: document.getElementById('navbar-user-name'),
    btnNotificationToggle: document.getElementById('btn-notification-toggle'),
    authView: document.getElementById('auth-view'),
    discordView: document.getElementById('discord-view'),
    authAlert: document.getElementById('auth-alert'),
    authAlertIcon: document.getElementById('auth-alert-icon'),
    authAlertContent: document.getElementById('auth-alert-content'),
    tabBtnLogin: document.getElementById('tab-btn-login'),
    tabBtnRegister: document.getElementById('tab-btn-register'),
    formLogin: document.getElementById('form-login'),
    formRegister: document.getElementById('form-register'),
    loginUsername: document.getElementById('login-username'),
    loginPassword: document.getElementById('login-password'),
    regUsername: document.getElementById('reg-username'),
    regDisplayname: document.getElementById('reg-displayname'),
    regPassword: document.getElementById('reg-password'),
    regNote: document.getElementById('reg-note'),
    noteCharCounter: document.getElementById('note-char-counter'),

    // Server Rail
    navBtnHome: document.getElementById('nav-btn-home'),
    homeBadgeCount: document.getElementById('home-badge-count'),
    navBtnCommunity: document.getElementById('nav-btn-community'),
    navBtnProxy: document.getElementById('nav-btn-proxy'),
    navBtnAdmin: document.getElementById('nav-btn-admin'),
    adminBadgeCount: document.getElementById('admin-badge-count'),
    adminBadgeCountTop: document.getElementById('admin-badge-count-top'),
    btnTopbarAdmin: document.getElementById('btn-topbar-admin'),

    // DM Notification Banner
    dmNotificationBanner: document.getElementById('dm-notification-banner'),
    btnEnableNotifications: document.getElementById('btn-enable-notifications'),
    btnDismissNotifications: document.getElementById('btn-dismiss-notifications'),

    // Sidebar Sections
    channelsSection: document.getElementById('channels-section'),
    dmSection: document.getElementById('dm-section'),
    channelList: document.getElementById('channel-list'),
    dmList: document.getElementById('dm-list'),
    btnSidebarFriends: document.getElementById('btn-sidebar-friends'),

    // User Profile Bottom Panel
    userPanelAvatar: document.getElementById('user-panel-avatar'),
    userPanelAvatarText: document.getElementById('user-panel-avatar-text'),
    userPanelDisplayname: document.getElementById('user-panel-displayname'),
    userPanelUsername: document.getElementById('user-panel-username'),
    btnLogout: document.getElementById('btn-logout'),

    // Chat Area
    chatHeaderIcon: document.getElementById('chat-header-icon'),
    chatHeaderName: document.getElementById('chat-header-name'),
    chatHeaderTopic: document.getElementById('chat-header-topic'),
    chatContainer: document.getElementById('chat-container'),
    friendsContainer: document.getElementById('friends-container'),
    messageStream: document.getElementById('message-stream'),
    chatInputContainer: document.querySelector('.chat-input-container'),
    formSendMessage: document.getElementById('form-send-message'),
    chatInputText: document.getElementById('chat-input-text'),
    btnSendMessage: document.getElementById('btn-send-message'),
    btnOpenEmbedModal: document.getElementById('btn-open-embed-modal'),
    mentionAutocompletePopup: document.getElementById('mention-autocomplete-popup'),
    mentionAutocompleteItemEveryone: document.getElementById('mention-autocomplete-item-everyone'),
    mentionQueryDisplay: document.getElementById('mention-query-display'),
    typingIndicator: document.getElementById('typing-indicator'),
    typingText: document.getElementById('typing-text'),

    // Members Sidebar
    membersSidebar: document.getElementById('members-sidebar'),
    btnToggleMembers: document.getElementById('btn-toggle-members'),
    adminMemberList: document.getElementById('admin-member-list'),
    regularMemberList: document.getElementById('regular-member-list'),
    countAdmins: document.getElementById('count-admins'),
    countMembers: document.getElementById('count-members'),

    // Friends Subnav
    subnavBtnOnline: document.getElementById('subnav-btn-online'),
    subnavBtnAll: document.getElementById('subnav-btn-all'),
    subnavBtnPending: document.getElementById('subnav-btn-pending'),
    subnavBtnAdd: document.getElementById('subnav-btn-add'),
    pendingFriendsBadge: document.getElementById('pending-friends-badge'),
    tabContentAdd: document.getElementById('tab-content-add'),
    tabContentList: document.getElementById('tab-content-list'),
    formAddFriend: document.getElementById('form-add-friend'),
    inputFriendUsername: document.getElementById('input-friend-username'),
    addFriendFeedback: document.getElementById('add-friend-feedback'),
    friendsListContainer: document.getElementById('friends-list-container'),
    friendListTitle: document.getElementById('friend-list-title'),

    // Modals
    modalAdminRequests: document.getElementById('modal-admin-requests'),
    btnCloseAdminModal: document.getElementById('btn-close-admin-modal'),
    adminTabPending: document.getElementById('admin-tab-pending'),
    adminTabHistory: document.getElementById('admin-tab-history'),
    adminTabUsers: document.getElementById('admin-tab-users'),
    adminRequestsList: document.getElementById('admin-requests-list'),

    modalRejectReason: document.getElementById('modal-reject-reason'),
    rejectTargetUser: document.getElementById('reject-target-user'),
    rejectNoteInput: document.getElementById('reject-note-input'),
    btnCancelReject: document.getElementById('btn-cancel-reject'),
    btnConfirmReject: document.getElementById('btn-confirm-reject'),
    btnCloseRejectModal: document.getElementById('btn-close-reject-modal'),

    modalEmbedBuilder: document.getElementById('modal-embed-builder'),
    btnCloseEmbedModal: document.getElementById('btn-close-embed-modal'),
    btnCancelEmbed: document.getElementById('btn-cancel-embed'),
    btnSendEmbed: document.getElementById('btn-send-embed'),
    btnAddEmbedField: document.getElementById('btn-add-embed-field'),
    embedFieldsContainer: document.getElementById('embed-fields-container'),
    embedTitle: document.getElementById('embed-title'),
    embedUrl: document.getElementById('embed-url'),
    embedDesc: document.getElementById('embed-desc'),
    embedAuthor: document.getElementById('embed-author'),
    embedFooter: document.getElementById('embed-footer'),
    embedImg: document.getElementById('embed-img'),
    embedThumb: document.getElementById('embed-thumb'),
    embedCustomColor: document.getElementById('embed-custom-color'),

    // Live Embed Preview Elements
    embedLiveCard: document.getElementById('embed-live-card'),
    previewAuthorRow: document.getElementById('preview-author-row'),
    previewAuthorText: document.getElementById('preview-author-text'),
    previewTitleRow: document.getElementById('preview-title-row'),
    previewTitleLink: document.getElementById('preview-title-link'),
    previewDesc: document.getElementById('preview-desc'),
    previewFieldsGrid: document.getElementById('preview-fields-grid'),
    previewBannerWrap: document.getElementById('preview-banner-wrap'),
    previewBannerImg: document.getElementById('preview-banner-img'),
    previewThumbWrap: document.getElementById('preview-thumb-wrap'),
    previewThumbImg: document.getElementById('preview-thumb-img'),
    previewFooterRow: document.getElementById('preview-footer-row'),
    previewFooterText: document.getElementById('preview-footer-text'),

    // User Profile Modal
    modalUserProfile: document.getElementById('modal-user-profile'),
    btnCloseProfileModal: document.getElementById('btn-close-profile-modal'),
    profileAvatarWrapper: document.getElementById('profile-avatar-wrapper'),
    profileModalAvatar: document.getElementById('profile-modal-avatar'),
    profileAvatarOverlay: document.getElementById('profile-avatar-overlay'),
    inputAvatarUpload: document.getElementById('input-avatar-upload'),
    profileAvatarActions: document.getElementById('profile-avatar-actions'),
    btnProfileChangeAvatar: document.getElementById('btn-profile-change-avatar'),
    btnProfileRemoveAvatar: document.getElementById('btn-profile-remove-avatar'),
    profileAvatarStatus: document.getElementById('profile-avatar-status'),
    profileBadgeRole: document.getElementById('profile-badge-role'),
    profileBadgeMembership: document.getElementById('profile-badge-membership'),
    profileModalDisplayname: document.getElementById('profile-modal-displayname'),
    profileModalUsername: document.getElementById('profile-modal-username'),
    profileModalBio: document.getElementById('profile-modal-bio'),
    btnEditBio: document.getElementById('btn-edit-bio'),
    profileBioEditWrap: document.getElementById('profile-bio-edit-wrap'),
    inputProfileBio: document.getElementById('input-profile-bio'),
    bioCharCount: document.getElementById('bio-char-count'),
    btnCancelBio: document.getElementById('btn-cancel-bio'),
    btnSaveBio: document.getElementById('btn-save-bio'),
    profileBioStatus: document.getElementById('profile-bio-status'),
    btnCopyUsername: document.getElementById('btn-copy-username'),
    profileStopAdsSection: document.getElementById('profile-stop-ads-section'),
    btnProfileStopAds: document.getElementById('btn-profile-stop-ads'),
    profileStopAdsBtnText: document.getElementById('profile-stop-ads-btn-text'),
    profileStopAdsNotice: document.getElementById('profile-stop-ads-notice'),
    btnProfileAddFriend: document.getElementById('btn-profile-add-friend'),
    profileBtnUsernameTarget: document.getElementById('profile-btn-username-target'),
    btnProfileStartChat: document.getElementById('btn-profile-start-chat'),
    profileBtnChatTarget: document.getElementById('profile-btn-chat-target'),
    btnProfileToggleMembership: document.getElementById('btn-profile-toggle-membership'),
    profileBtnMembershipText: document.getElementById('profile-btn-membership-text'),
    btnProfileToggleAdmin: document.getElementById('btn-profile-toggle-admin'),
    profileBtnAdminText: document.getElementById('profile-btn-admin-text'),
    btnProfileDeleteUser: document.getElementById('btn-profile-delete-user'),

    // Image Upload & Staging
    inputChatImage: document.getElementById('input-chat-image'),
    btnAttachImage: document.getElementById('btn-attach-image'),
    chatImagePreviewTray: document.getElementById('chat-image-preview-tray'),
    chatImagePreviewThumb: document.getElementById('chat-image-preview-thumb'),
    chatImagePreviewName: document.getElementById('chat-image-preview-name'),
    chatImagePreviewSize: document.getElementById('chat-image-preview-size'),
    btnCancelStagedImage: document.getElementById('btn-cancel-staged-image'),

    // Image Lightbox
    modalImageLightbox: document.getElementById('modal-image-lightbox'),
    lightboxImg: document.getElementById('lightbox-img'),
    lightboxFilename: document.getElementById('lightbox-filename'),
    lightboxDownloadLink: document.getElementById('lightbox-download-link'),
    btnCloseLightbox: document.getElementById('btn-close-lightbox'),
    lightboxBackdrop: document.getElementById('lightbox-backdrop'),

    // Name Change Profile Elements
    profileNameEditSection: document.getElementById('profile-name-edit-section'),
    btnToggleNameEdit: document.getElementById('btn-toggle-name-edit'),
    nameEditToggleLabel: document.getElementById('name-edit-toggle-label'),
    profileNameStatusBadge: document.getElementById('profile-name-status-badge'),
    profileNameCooldownText: document.getElementById('profile-name-cooldown-text'),
    profileNameEditForm: document.getElementById('profile-name-edit-form'),
    inputEditDisplayName: document.getElementById('input-edit-displayname'),
    inputEditUsername: document.getElementById('input-edit-username'),
    btnCancelNameEdit: document.getElementById('btn-cancel-name-edit'),
    btnSaveNameEdit: document.getElementById('btn-save-name-edit'),
    profileNameFeedback: document.getElementById('profile-name-feedback'),

    // Telegram E2EE Encryption Modal Elements
    btnEncryptionInfo: document.getElementById('btn-encryption-info'),
    modalEncryptionInfo: document.getElementById('modal-encryption-info'),
    btnCloseCryptoModal: document.getElementById('btn-close-crypto-modal'),
    btnDoneCryptoModal: document.getElementById('btn-done-crypto-modal'),
    cryptoEmojisRow: document.getElementById('crypto-emojis-row'),
    cryptoHexFingerprint: document.getElementById('crypto-hex-fingerprint'),

    // Web Proxy View Elements
    proxyView: document.getElementById('proxy-view'),
    btnProxyBack: document.getElementById('btn-proxy-back'),
    btnProxyForward: document.getElementById('btn-proxy-forward'),
    btnProxyRefresh: document.getElementById('btn-proxy-refresh'),
    btnProxyHome: document.getElementById('btn-proxy-home'),
    formProxyOmnibox: document.getElementById('form-proxy-omnibox'),
    inputProxyUrl: document.getElementById('input-proxy-url'),
    btnToggleWispPanel: document.getElementById('btn-toggle-wisp-panel'),
    wispDiagnosticsDrawer: document.getElementById('wisp-diagnostics-drawer'),
    displayWispUrl: document.getElementById('display-wisp-url'),
    wispPingResult: document.getElementById('wisp-ping-result'),
    wispPingText: document.getElementById('wisp-ping-text'),
    btnPingWisp: document.getElementById('btn-ping-wisp'),
    proxyHomePage: document.getElementById('proxy-home-page'),
    proxyViewportContainer: document.getElementById('proxy-viewport-container'),
    proxyIframe: document.getElementById('proxy-iframe'),
    selectSearchEngine: document.getElementById('select-search-engine'),
    selectTabCloaker: document.getElementById('select-tab-cloaker'),
    btnProxyStealthPopout: document.getElementById('btn-proxy-stealth-popout'),
    btnProxyQuickGba: document.getElementById('btn-proxy-quick-gba'),
    tabFavicon: document.getElementById('tab-favicon'),
    proxyControlBar: document.getElementById('proxy-control-bar'),

    // PeteZah UI Elements
    formPzSearch: document.getElementById('form-pz-search'),
    inputPzSearch: document.getElementById('input-pz-search'),
    btnPzTrending: document.getElementById('btn-pz-trending'),
    btnPzFooterTrending: document.getElementById('btn-pz-footer-trending'),
    btnPzDiscord: document.getElementById('btn-pz-discord'),
    btnPzGetLinks: document.getElementById('btn-pz-get-links'),
    btnPzDockAdd: document.getElementById('btn-pz-dock-add'),
    pzCatGames: document.getElementById('pz-cat-games'),
    pzCatApps: document.getElementById('pz-cat-apps'),
    pzCatMusic: document.getElementById('pz-cat-music'),
    pzCatMovies: document.getElementById('pz-cat-movies'),
    pzCatFilm: document.getElementById('pz-cat-film'),
    pzCatTv: document.getElementById('pz-cat-tv'),
    pzCatDrive: document.getElementById('pz-cat-drive'),
    pzCatChat: document.getElementById('pz-cat-chat'),
    pzCatAdd: document.getElementById('pz-cat-add'),
    pzCustomShortcutsRow: document.getElementById('pz-custom-shortcuts-row'),
    pzEngineTrigger: document.getElementById('pz-engine-trigger'),
    pzEngineDropdown: document.getElementById('pz-engine-dropdown'),
    pzEngineCurrentName: document.getElementById('pz-engine-current-name'),
    pzLiveClock: document.getElementById('pz-live-clock'),
    pzTabCountText: document.getElementById('pz-tab-count-text'),

    // PeteZah Modals
    modalPzTrending: document.getElementById('modal-pz-trending'),
    btnClosePzTrending: document.getElementById('btn-close-pz-trending'),
    modalPzLinks: document.getElementById('modal-pz-links'),
    btnClosePzLinks: document.getElementById('btn-close-pz-links'),
    modalPzApps: document.getElementById('modal-pz-apps'),
    btnClosePzApps: document.getElementById('btn-close-pz-apps'),
    modalPzAdd: document.getElementById('modal-pz-add'),
    btnClosePzAdd: document.getElementById('btn-close-pz-add'),
    btnCancelPzAdd: document.getElementById('btn-cancel-pz-add'),
    formPzAddShortcut: document.getElementById('form-pz-add-shortcut'),
    inputPzShortcutTitle: document.getElementById('input-pz-shortcut-title'),
    inputPzShortcutUrl: document.getElementById('input-pz-shortcut-url'),
    modalPzInfo: document.getElementById('modal-pz-info'),
    btnClosePzInfo: document.getElementById('btn-close-pz-info'),
    pzInfoTitle: document.getElementById('pz-info-title'),
    pzInfoBody: document.getElementById('pz-info-body'),
    pzLinkDiscord: document.getElementById('pz-link-discord'),
    pzLinkTos: document.getElementById('pz-link-tos'),
    pzLinkPrivacy: document.getElementById('pz-link-privacy'),
    pzLinkDmca: document.getElementById('pz-link-dmca'),
    pzDisplayLocalMirror: document.getElementById('pz-display-local-mirror'),
    btnCopyLocalMirror: document.getElementById('btn-copy-local-mirror'),

    // Update Requests View Elements
    updatesView: document.getElementById('updates-view'),
    statTotalRequests: document.getElementById('stat-total-requests'),
    statCompletedRequests: document.getElementById('stat-completed-requests'),
    statPlannedRequests: document.getElementById('stat-planned-requests'),
    btnOpenSubmitUpdateReq: document.getElementById('btn-open-submit-update-req'),
    inputUpdatesSearch: document.getElementById('input-updates-search'),
    updatesCategoryFilters: document.getElementById('updates-category-filters'),
    selectUpdatesStatus: document.getElementById('select-updates-status'),
    selectUpdatesSort: document.getElementById('select-updates-sort'),
    updatesGrid: document.getElementById('updates-grid'),
    modalAddUpdateReq: document.getElementById('modal-add-update-req'),
    btnCloseUpdateReq: document.getElementById('btn-close-update-req'),
    btnCancelUpdateReq: document.getElementById('btn-cancel-update-req'),
    formAddUpdateReq: document.getElementById('form-add-update-req'),
    inputUpdateReqTitle: document.getElementById('input-update-req-title'),
    selectUpdateReqCategory: document.getElementById('select-update-req-category'),
    inputUpdateReqDesc: document.getElementById('input-update-req-desc'),
    updateReqCharCount: document.getElementById('update-req-char-count'),
    updateReqAlert: document.getElementById('update-req-alert'),
    updateReqAlertIcon: document.getElementById('update-req-alert-icon'),
    updateReqAlertContent: document.getElementById('update-req-alert-content'),
    btnSubmitUpdateReq: document.getElementById('btn-submit-update-req'),
    modalAdminUpdateReq: document.getElementById('modal-admin-update-req'),
    btnCloseAdminUpdateReq: document.getElementById('btn-close-admin-update-req'),
    btnCancelAdminUpdateReq: document.getElementById('btn-cancel-admin-update-req'),
    formAdminUpdateReq: document.getElementById('form-admin-update-req'),
    inputAdminReqId: document.getElementById('input-admin-req-id'),
    selectAdminReqStatus: document.getElementById('select-admin-req-status'),
    inputAdminReqResponse: document.getElementById('input-admin-req-response'),
    btnAdminReqDelete: document.getElementById('btn-admin-req-delete'),
    btnSaveAdminUpdateReq: document.getElementById('btn-save-admin-update-req'),
    adminUpdateReqAlert: document.getElementById('admin-update-req-alert'),
    adminUpdateReqAlertIcon: document.getElementById('admin-update-req-alert-icon'),
    adminUpdateReqAlertContent: document.getElementById('admin-update-req-alert-content'),

    // HTML & JS Code Editor Elements
    editorView: document.getElementById('editor-view'),
    tabEditorHtml: document.getElementById('tab-editor-html'),
    tabEditorCss: document.getElementById('tab-editor-css'),
    tabEditorJs: document.getElementById('tab-editor-js'),
    selectEditorTemplate: document.getElementById('select-editor-template'),
    btnEditorAutorun: document.getElementById('btn-editor-autorun'),
    btnEditorRun: document.getElementById('btn-editor-run'),
    btnEditorClear: document.getElementById('btn-editor-clear'),
    btnEditorDownload: document.getElementById('btn-editor-download'),
    btnEditorPopout: document.getElementById('btn-editor-popout'),
    editorTextareaHtml: document.getElementById('editor-textarea-html'),
    editorTextareaCss: document.getElementById('editor-textarea-css'),
    editorTextareaJs: document.getElementById('editor-textarea-js'),
    editorCursorPos: document.getElementById('editor-cursor-pos'),
    editorSaveIndicator: document.getElementById('editor-save-indicator'),
    btnRefreshPreview: document.getElementById('btn-refresh-preview'),
    btnToggleConsole: document.getElementById('btn-toggle-console'),
    consoleBadge: document.getElementById('console-badge'),
    editorPreviewFrame: document.getElementById('editor-preview-frame'),
    editorConsolePanel: document.getElementById('editor-console-panel'),
    btnClearConsole: document.getElementById('btn-clear-console'),
    editorConsoleLogs: document.getElementById('editor-console-logs'),

    // Games & Arcade Elements
    gamesView: document.getElementById('games-view'),
    gamesListView: document.getElementById('games-list-view'),

    // Movies & Cinema Elements
    moviesView: document.getElementById('movies-view'),
    moviesListView: document.getElementById('movies-list-view'),
    moviesGrid: document.getElementById('movies-grid'),
    moviesEmptyState: document.getElementById('movies-empty-state'),
    moviesEmptyTitle: document.getElementById('movies-empty-title'),
    moviesEmptyDesc: document.getElementById('movies-empty-desc'),
    moviesCountBadge: document.getElementById('movies-count-badge'),
    moviesSearchInput: document.getElementById('movies-search-input'),
    btnClearMoviesSearch: document.getElementById('btn-clear-movies-search'),
    btnMoviesSearchSubmit: document.getElementById('btn-movies-search-submit'),
    moviesGenrePills: document.getElementById('movies-genre-pills'),
    btnRefreshMovies: document.getElementById('btn-refresh-movies'),
    btnRescanEmpty: document.getElementById('btn-rescan-empty'),
    moviesHeroBanner: document.getElementById('movies-hero-banner'),
    moviesHeroBackdrop: document.getElementById('movies-hero-backdrop'),
    moviesHeroTitle: document.getElementById('movies-hero-title'),
    moviesHeroYear: document.getElementById('movies-hero-year'),
    moviesHeroRating: document.getElementById('movies-hero-rating'),
    moviesHeroRuntime: document.getElementById('movies-hero-runtime'),
    moviesHeroGenre: document.getElementById('movies-hero-genre'),
    moviesHeroDesc: document.getElementById('movies-hero-desc'),
    moviesHeroPosterImg: document.getElementById('movies-hero-poster-img'),
    btnHeroWatch: document.getElementById('btn-hero-watch'),
    btnHeroDetails: document.getElementById('btn-hero-details'),
    btnHeroWatchlist: document.getElementById('btn-hero-watchlist'),
    heroWatchlistText: document.getElementById('hero-watchlist-text'),
    btnHeroPrev: document.getElementById('btn-hero-prev'),
    btnHeroNext: document.getElementById('btn-hero-next'),
    moviesHeroDots: document.getElementById('movies-hero-dots'),
    moviesHomeRows: document.getElementById('movies-home-rows'),
    moviesGridSection: document.getElementById('movies-grid-section'),
    btnBackToRows: document.getElementById('btn-back-to-rows'),
    movieModalSimilarSection: document.getElementById('movie-modal-similar-section'),
    movieModalSimilarList: document.getElementById('movie-modal-similar-list'),
    moviesLocalSection: document.getElementById('movies-local-section'),
    moviesLocalGrid: document.getElementById('movies-local-grid'),
    moviesLocalCount: document.getElementById('movies-local-count'),
    moviesCatalogTitle: document.getElementById('movies-catalog-title'),
    moviesCatalogCount: document.getElementById('movies-catalog-count'),
    moviesCatalogIcon: document.getElementById('movies-catalog-icon'),
    movieDetailsModal: document.getElementById('movie-details-modal'),
    btnCloseMovieModal: document.getElementById('btn-close-movie-modal'),
    movieModalBackdropImg: document.getElementById('movie-modal-backdrop-img'),
    movieModalPosterImg: document.getElementById('movie-modal-poster-img'),
    movieModalRatingBadge: document.getElementById('movie-modal-rating-badge'),
    movieModalHdBadge: document.getElementById('movie-modal-hd-badge'),
    movieModalTitle: document.getElementById('movie-modal-title'),
    movieModalYear: document.getElementById('movie-modal-year'),
    movieModalRated: document.getElementById('movie-modal-rated'),
    movieModalRuntime: document.getElementById('movie-modal-runtime'),
    movieModalGenres: document.getElementById('movie-modal-genres'),
    movieModalPlot: document.getElementById('movie-modal-plot'),
    movieModalDirector: document.getElementById('movie-modal-director'),
    movieModalActors: document.getElementById('movie-modal-actors'),
    movieModalServersList: document.getElementById('movie-modal-servers-list'),
    btnModalWatchNow: document.getElementById('btn-modal-watch-now'),
    btnModalDownload: document.getElementById('btn-modal-download'),
    modalDownloadLabel: document.getElementById('modal-download-label'),
    modalDownloadNotice: document.getElementById('modal-download-notice'),
    moviePlayerView: document.getElementById('movie-player-view'),
    moviePlayerStage: document.getElementById('movie-player-stage'),
    playerIframe: document.getElementById('movie-player-frame'),
    movieVideoElement: document.getElementById('bokit-movie-player') || document.getElementById('movie-video-element'),
    bokitMoviePlayer: document.getElementById('bokit-movie-player'),
    movieCustomControls: document.getElementById('movie-custom-controls'),
    btnPlayerCenterPlay: document.getElementById('btn-player-center-play'),
    playerBufferingSpinner: document.getElementById('player-buffering-spinner'),
    playerScrubberContainer: document.getElementById('player-scrubber-container'),
    playerScrubberTrack: document.getElementById('player-scrubber-track'),
    playerScrubberBuffer: document.getElementById('player-scrubber-buffer'),
    playerScrubberProgress: document.getElementById('player-scrubber-progress'),
    playerScrubberHandle: document.getElementById('player-scrubber-handle'),
    playerScrubberTooltip: document.getElementById('player-scrubber-tooltip'),
    btnCtrlPlay: document.getElementById('btn-ctrl-play'),
    btnCtrlRewind10: document.getElementById('btn-ctrl-rewind10'),
    btnCtrlForward10: document.getElementById('btn-ctrl-forward10'),
    btnCtrlVolume: document.getElementById('btn-ctrl-volume'),
    ctrlVolumeSlider: document.getElementById('ctrl-volume-slider'),
    ctrlCurrentTime: document.getElementById('ctrl-current-time'),
    ctrlDurationTime: document.getElementById('ctrl-duration-time'),
    ctrlQualityBadge: document.getElementById('ctrl-quality-badge'),
    moviePlayerQualitySelect: document.getElementById('movie-player-quality-select'),
    moviePlayerSpeedSelect: document.getElementById('movie-player-speed-select'),
    btnCtrlPip: document.getElementById('btn-ctrl-pip'),
    btnCtrlFullscreen: document.getElementById('btn-ctrl-fullscreen'),
    moviePlayerTitle: document.getElementById('movie-player-title'),
    moviePlayerYear: document.getElementById('movie-player-year'),
    moviePlayerBadge: document.getElementById('movie-player-badge'),
    moviePlayerSize: document.getElementById('movie-player-size'),
    moviePlayerServerSelect: document.getElementById('movie-player-server-select'),
    moviePlayerServerDot: document.getElementById('movie-player-server-dot'),
    btnPlayerDownload: document.getElementById('btn-player-download'),
    moviePlayerSourcesBar: document.getElementById('movie-player-sources-bar'),
    moviePlayerSourcesList: document.getElementById('movie-player-sources-list'),
    moviePlayerErrorOverlay: document.getElementById('movie-player-error-overlay'),
    movieErrorTitle: document.getElementById('movie-error-title'),
    movieErrorDesc: document.getElementById('movie-error-desc'),
    btnMovieErrorSwitch: document.getElementById('btn-movie-error-switch'),
    btnMovieErrorTrailer: document.getElementById('btn-movie-error-trailer'),
    btnMovieErrorDownload: document.getElementById('btn-movie-error-download'),
    moviesTypeFilter: document.getElementById('movies-type-filter'),
    moviesYearFilter: document.getElementById('movies-year-filter'),
    btnHeroTrailer: document.getElementById('btn-hero-trailer'),
    moviesContinueWatchingSection: document.getElementById('movies-continue-watching-section'),
    moviesContinueWatchingGrid: document.getElementById('movies-continue-watching-grid'),
    moviesContinueWatchingCount: document.getElementById('movies-continue-watching-count'),
    btnClearContinueWatching: document.getElementById('btn-clear-continue-watching'),
    moviesWatchlistSection: document.getElementById('movies-watchlist-section'),
    moviesWatchlistGrid: document.getElementById('movies-watchlist-grid'),
    moviesWatchlistCount: document.getElementById('movies-watchlist-count'),
    btnModalTrailer: document.getElementById('btn-modal-trailer'),
    btnModalWatchlist: document.getElementById('btn-modal-watchlist'),
    modalWatchlistText: document.getElementById('modal-watchlist-text'),
    modalWatchLabel: document.getElementById('modal-watch-label'),
    movieModalTvSection: document.getElementById('movie-modal-tv-section'),
    movieModalSeasonSelect: document.getElementById('movie-modal-season-select'),
    movieModalEpisodesList: document.getElementById('movie-modal-episodes-list'),
    moviePlayerTvControls: document.getElementById('movie-player-tv-controls'),
    btnPlayerPrevEp: document.getElementById('btn-player-prev-ep'),
    moviePlayerEpSelect: document.getElementById('movie-player-ep-select'),
    btnPlayerNextEp: document.getElementById('btn-player-next-ep'),
    movieTrailerModal: document.getElementById('movie-trailer-modal'),
    movieTrailerTitle: document.getElementById('movie-trailer-title'),
    movieTrailerFrame: document.getElementById('movie-trailer-frame'),
    btnCloseTrailerModal: document.getElementById('btn-close-trailer-modal'),
    btnMovieBack: document.getElementById('btn-movie-back'),
    btnMoviePip: document.getElementById('btn-movie-pip'),
    btnMovieFullscreen: document.getElementById('btn-movie-fullscreen'),
    movieAmbientGlow: document.getElementById('movie-ambient-glow'),
    btnMoviesLoadMore: document.getElementById('btn-movies-load-more'),
    moviesInfiniteAnchor: document.getElementById('movies-infinite-anchor'),
    moviesCatalogEndHint: document.getElementById('movies-catalog-end-hint'),
    moviePlayerResumeToast: document.getElementById('movie-player-resume-toast'),
    movieResumeToastText: document.getElementById('movie-resume-toast-text'),
    btnMovieProvidersDebug: document.getElementById('btn-movie-providers-debug'),
    btnMoviePlayerDiagnostics: document.getElementById('btn-movie-player-diagnostics'),
    movieStatusModal: document.getElementById('movie-status-modal'),
    btnCloseMovieStatusModal: document.getElementById('btn-close-movie-status-modal'),
    btnRetestProviders: document.getElementById('btn-retest-providers'),
    metricHealthyCount: document.getElementById('metric-healthy-count'),
    metricTotalCount: document.getElementById('metric-total-count'),
    metricAvgLatency: document.getElementById('metric-avg-latency'),
    metricFailoverStatus: document.getElementById('metric-failover-status'),
    metricLocalCount: document.getElementById('metric-local-count'),
    metricLocalBytes: document.getElementById('metric-local-bytes'),
    statusPlaybackTbody: document.getElementById('status-playback-tbody'),
    statusMetadataTbody: document.getElementById('status-metadata-tbody'),
    statusTelemetryTbody: document.getElementById('status-telemetry-tbody'),
    diagSelectProvider: document.getElementById('diag-select-provider'),
    diagInputId: document.getElementById('diag-input-id'),
    btnRunDiag: document.getElementById('btn-run-diag'),
    playerSubtitlePill: document.getElementById('player-subtitle-pill'),
    moviePlayerSubtitleSelect: document.getElementById('movie-player-subtitle-select'),
    gamesGrid: document.getElementById('games-grid'),
    gamesEmptyState: document.getElementById('games-empty-state'),
    gamesCountBadge: document.getElementById('games-count-badge'),
    gamesSearchInput: document.getElementById('games-search-input'),
    btnClearGamesSearch: document.getElementById('btn-clear-games-search'),
    gamesCategoryPills: document.getElementById('games-category-pills'),
    gamePlayerView: document.getElementById('game-player-view'),
    gamePlayerFrame: document.getElementById('game-player-frame'),
    gamePlayerTitle: document.getElementById('game-player-title'),
    gamePlayerThumb: document.getElementById('game-player-thumb'),
    btnGameBack: document.getElementById('btn-game-back'),
    btnGameReload: document.getElementById('btn-game-reload'),
    btnGameFullscreen: document.getElementById('btn-game-fullscreen'),
    btnGamePopout: document.getElementById('btn-game-popout'),

    // Monetag & Game Interstitial Elements
    gameInterstitialOverlay: document.getElementById('game-interstitial-overlay'),
    interstitialGameName: document.getElementById('interstitial-game-name'),
    interstitialTimerBar: document.getElementById('interstitial-progress-fill'),
    interstitialTimerLabel: document.getElementById('interstitial-timer-label'),
    btnSkipGameAd: document.getElementById('btn-skip-game-ad'),
    monetagBannerInjection: document.getElementById('monetag-banner-injection'),
    modalPrivacyPolicy: document.getElementById('modal-privacy-policy'),
    btnOpenPrivacyPolicy: document.getElementById('btn-open-privacy-policy'),
    btnClosePrivacyPolicy: document.getElementById('btn-close-privacy-policy'),
    btnAcceptPrivacy: document.getElementById('btn-accept-privacy'),
    modalTermsService: document.getElementById('modal-terms-service'),
    btnOpenTermsService: document.getElementById('btn-open-terms-service'),
    btnCloseTermsService: document.getElementById('btn-close-terms-service'),
    btnAcceptTerms: document.getElementById('btn-accept-terms'),
    modalMonetagSettings: document.getElementById('modal-monetag-settings'),
    btnOpenMonetagSettings: document.getElementById('btn-open-monetag-settings'),
    btnCloseMonetagSettings: document.getElementById('btn-close-monetag-settings'),
    btnDoneMonetagSettings: document.getElementById('btn-done-monetag-settings'),
    formMonetagConfig: document.getElementById('form-monetag-config'),
    monetagInputTag: document.getElementById('monetag-input-tag'),
    monetagInputZone: document.getElementById('monetag-input-zone'),
    monetagInputDirect: document.getElementById('monetag-input-direct'),
    monetagInputAutoOpen: document.getElementById('monetag-input-auto-open'),
    btnSaveMonetag: document.getElementById('btn-save-monetag'),
    btnTestGameAd: document.getElementById('btn-test-game-ad'),
    monetagStatusBadge: document.getElementById('monetag-status-badge'),

    // Live Visitor Counter in Corner
    liveVisitorCounter: document.getElementById('live-visitor-counter'),
    liveVisitorCountText: document.getElementById('live-visitor-count-text'),
  };

  // ============================================================================
  // INITIALIZATION & AUTH CHECKS
  // ============================================================================

  async function init() {
    setupEventListeners();
    setupEmbedBuilderListeners();
    setupProxyListeners();
    setupUpdateRequestsListeners();
    setupEditorListeners();
    setupGamesListeners();
    setupMonetagListeners();
    setupMoviesListeners();
    initNotificationSystem();
    initLiveVisitorCounter();

    if (state.token) {
      const valid = await verifySession();
      if (valid) {
        showDiscordView();
        return;
      }
    }
    showAuthView();
  }

  async function verifySession() {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${state.token}` },
      });
      if (!res.ok) {
        localStorage.removeItem('bokitcord_token');
        state.token = null;
        return false;
      }
      state.user = await res.json();
      return true;
    } catch (err) {
      console.error('Session verify error:', err);
      return false;
    }
  }

  function showAuthView() {
    if (el.globalTopNavbar) el.globalTopNavbar.classList.add('hidden');
    el.discordView.classList.add('hidden');
    if (el.proxyView) el.proxyView.classList.add('hidden');
    if (el.updatesView) el.updatesView.classList.add('hidden');
    if (el.editorView) el.editorView.classList.add('hidden');
    if (el.gamesView) el.gamesView.classList.add('hidden');
    el.authView.classList.remove('hidden');
    if (el.tabBtnLogin) el.tabBtnLogin.click();
  }

  function setAvatarContent(avatarEl, user) {
    if (!avatarEl) return;
    const initial = ((user && (user.displayName || user.username)) || 'U').charAt(0).toUpperCase();
    const color = (user && user.avatarColor) || '#5865F2';
    const avatarUrl = user && user.avatarUrl;
    const textSpan = avatarEl.querySelector('span');

    if (avatarUrl) {
      avatarEl.style.backgroundColor = 'transparent';
      avatarEl.style.backgroundImage = `url("${avatarUrl}")`;
      avatarEl.style.backgroundSize = 'cover';
      avatarEl.style.backgroundPosition = 'center';
      avatarEl.style.backgroundRepeat = 'no-repeat';
      if (textSpan) {
        textSpan.textContent = '';
      } else {
        avatarEl.textContent = '';
      }
    } else {
      avatarEl.style.backgroundImage = 'none';
      avatarEl.style.backgroundColor = color;
      if (textSpan) {
        textSpan.textContent = initial;
      } else {
        avatarEl.textContent = initial;
      }
    }
  }

  function refreshVisibleMessageAvatars() {
    document.querySelectorAll('.chat-message').forEach((msgEl) => {
      const uid = msgEl.dataset.userId;
      const uname = msgEl.dataset.username;
      const author = (state.user && (state.user.id === uid || (uname && state.user.username.toLowerCase() === uname)))
        ? state.user
        : (state.users || []).find((u) => u.id === uid || (u.username && uname && u.username.toLowerCase() === uname));
      if (author) {
        const av = msgEl.querySelector('.msg-avatar');
        if (av) {
          setAvatarContent(av, author);
        }
      }
    });
  }

  function showDiscordView() {
    if (!state.user) return;

    el.authView.classList.add('hidden');
    if (el.globalTopNavbar) el.globalTopNavbar.classList.remove('hidden');

    // Default to Chat tab active, or Movies if hash begins with #movies
    if (window.location.hash.startsWith('#movies')) {
      switchAppTab('movies');
    } else {
      switchAppTab('chat');
    }

    // Update bottom user panel
    setAvatarContent(el.userPanelAvatar, state.user);
    el.userPanelDisplayname.textContent = state.user.displayName;
    el.userPanelUsername.textContent = `@${state.user.username}`;

    // Update top navbar user chip
    if (el.navbarUserAvatar) {
      setAvatarContent(el.navbarUserAvatar, state.user);
    }
    if (el.navbarUserName) {
      el.navbarUserName.textContent = state.user.displayName || `@${state.user.username}`;
    }

    refreshVisibleMessageAvatars();

    // Update dynamic Wisp URL
    if (el.displayWispUrl) {
      const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      el.displayWispUrl.textContent = `${wsProto}//${window.location.host}/wisp/`;
    }

    // Show/Hide bokit admin controls
    const isBokit = state.user.username.toLowerCase() === 'bokit';
    if (isBokit) {
      el.navBtnAdmin.classList.remove('hidden');
      el.btnTopbarAdmin.classList.remove('hidden');
      fetchAdminRequests();
    } else {
      el.navBtnAdmin.classList.add('hidden');
      el.btnTopbarAdmin.classList.add('hidden');
    }

    initSocket();
    loadChannels();
    loadUsers();
    loadFriends();
    loadActiveDms();
    checkNotificationBannerPrompt();
    updateNotificationToggleState();
    updateAllDmBadges();
    updateChatInputPermissions();
  }

  // ============================================================================
  // SOCKET.IO REALTIME ENGINE
  // ============================================================================

  function initSocket() {
    if (state.socket) {
      state.socket.disconnect();
    }

    state.socket = io();

    state.socket.on('connect', () => {
      state.socket.emit('authenticate', { token: state.token });
      state.socket.emit('join_channel', { channelId: state.currentChannelId });
    });

    state.socket.on('new_message', async (msg) => {
      if (msg.username) {
        removeActiveTyper(msg.channelId, msg.username);
      }
      if (msg.channelId === state.currentChannelId) {
        const preparedMsg = await decryptIfNeeded(msg);
        appendMessage(preparedMsg);
        scrollToBottom();
      }
    });

    state.socket.on('dm_received', async ({ channelId, message, sender }) => {
      if (sender && sender.username) {
        removeActiveTyper(channelId, sender.username);
      }
      if (sender && state.user && sender.id !== state.user.id) {
        addOpenDm(sender);

        const isActivelyLookingAtThisDm =
          state.currentView === 'dm' &&
          state.currentChannelId === channelId &&
          !document.hidden &&
          el.discordView && !el.discordView.classList.contains('hidden');

        if (!isActivelyLookingAtThisDm) {
          // Increment unread count for this contact
          state.unreadDmCounts[sender.id] = (state.unreadDmCounts[sender.id] || 0) + 1;
          state.unreadDms.add(sender.id);
          updateAllDmBadges();

          // Play notification chime
          playDmNotificationSound();

          // Trigger Web Desktop Notification if allowed
          if ('Notification' in window && Notification.permission === 'granted') {
            const preparedMsg = await decryptIfNeeded(message);
            const preview = preparedMsg.content || (preparedMsg.embed ? (preparedMsg.embed.title || 'Sent an attachment') : 'Sent you a direct message');
            const notifTitle = sender.displayName ? `${sender.displayName} (@${sender.username})` : `@${sender.username}`;

            try {
              const notif = new Notification(notifTitle, {
                body: preview.length > 120 ? preview.slice(0, 117) + '...' : preview,
                icon: '/favicon.ico',
                tag: `dm_${sender.id}`,
              });

              notif.onclick = () => {
                window.focus();
                switchAppTab('chat');
                openDirectMessage(sender);
                notif.close();
              };
            } catch (notifErr) {
              console.error('[Web Notification Error]:', notifErr);
            }
          }
        }
      }
    });

    state.socket.on('message_deleted', ({ messageId, channelId }) => {
      removeMessageFromStream(messageId);
    });

    state.socket.on('user_typing', ({ channelId, username, displayName }) => {
      if (state.user && (username === state.user.username || (state.user.displayName && displayName === state.user.displayName))) return;
      if (!state.activeTypers[channelId]) {
        state.activeTypers[channelId] = {};
      }
      if (state.activeTypers[channelId][username]) {
        clearTimeout(state.activeTypers[channelId][username].timer);
      }
      const timer = setTimeout(() => {
        removeActiveTyper(channelId, username);
      }, 4000);
      state.activeTypers[channelId][username] = {
        displayName: displayName || username,
        timer,
      };
      if (channelId === state.currentChannelId) {
        updateTypingIndicatorDisplay();
      }
    });

    state.socket.on('user_stop_typing', ({ channelId, username }) => {
      removeActiveTyper(channelId, username);
    });

    state.socket.on('user_presence', ({ userId, status }) => {
      const u = state.users.find((user) => user.id === userId);
      if (u) {
        u.status = status;
        renderMembers();
      }
      const dmContact = state.openDms.find((dm) => dm.id === userId);
      if (dmContact) {
        dmContact.status = status;
        renderDmList();
      }
      const friendItem = state.friends.find((f) => f.friend && f.friend.id === userId);
      if (friendItem) {
        friendItem.friend.status = status;
        if (state.currentView === 'friends' && state.friendsTab === 'online') {
          renderFriendsList(state.friendsTab);
        }
      }
    });

    // Bokit real-time approval requests
    state.socket.on('admin_new_request', (reqData) => {
      if (state.user && state.user.username.toLowerCase() === 'bokit') {
        fetchAdminRequests();
        showAdminNotificationBadge();
      }
    });

    state.socket.on('request_updated', ({ username, status, rejectionNote }) => {
      // If admin bokit, refresh
      if (state.user && state.user.username.toLowerCase() === 'bokit') {
        fetchAdminRequests();
      }
      loadUsers();
    });

    state.socket.on('user_deleted', ({ userId, username }) => {
      loadUsers();
      loadFriends();
      if (state.activeAdminTab === 'users' && el.modalAdminRequests && !el.modalAdminRequests.classList.contains('hidden')) {
        renderAdminManageAccounts();
      }
    });

    state.socket.on('account_deleted', ({ message }) => {
      alert(message || 'Your account was deleted by administrator bokit.');
      localStorage.removeItem('bokitcord_token');
      state.token = null;
      state.user = null;
      if (state.socket) state.socket.disconnect();
      showAuthView();
    });

    state.socket.on('friend_request_received', (data) => {
      loadFriends();
    });

    state.socket.on('friend_updated', () => {
      loadFriends();
    });

    state.socket.on('user_updated', (updatedUser) => {
      if (!updatedUser) return;

      // 1. If self, update state.user and UI
      if (state.user && state.user.id === updatedUser.id) {
        state.user.avatarUrl = updatedUser.avatarUrl;
        state.user.displayName = updatedUser.displayName;
        state.user.username = updatedUser.username;
        state.user.avatarColor = updatedUser.avatarColor;
        if (updatedUser.role !== undefined) {
          state.user.role = updatedUser.role;
        }
        if (updatedUser.hasMembership !== undefined) {
          state.user.hasMembership = Boolean(updatedUser.hasMembership);
        }
        if (updatedUser.bio !== undefined) {
          state.user.bio = updatedUser.bio;
        }
        localStorage.setItem('bokit_user', JSON.stringify(state.user));
        if (el.userPanelDisplayname) el.userPanelDisplayname.textContent = updatedUser.displayName || updatedUser.username;
        if (el.userPanelUsername) el.userPanelUsername.textContent = `@${updatedUser.username}`;
        if (el.navbarUserName) el.navbarUserName.textContent = updatedUser.displayName || updatedUser.username;
        setAvatarContent(el.userPanelAvatar, state.user);
        if (el.navbarUserAvatar) {
          setAvatarContent(el.navbarUserAvatar, state.user);
        }
      }

      // Update DOM rendered message headers if this user posted messages in view
      const userMsgs = document.querySelectorAll(`.chat-message[data-user-id="${updatedUser.id}"]`);
      userMsgs.forEach((msgEl) => {
        const dnameEl = msgEl.querySelector('.msg-displayname');
        if (dnameEl) dnameEl.textContent = updatedUser.displayName || updatedUser.username;
        const unameEl = msgEl.querySelector('.msg-username-tag');
        if (unameEl) unameEl.textContent = `@${updatedUser.username}`;
        const avatarEl = msgEl.querySelector('.msg-avatar');
        if (avatarEl) setAvatarContent(avatarEl, updatedUser);
      });

      // 2. In state.users list
      if (state.users) {
        const u = state.users.find((x) => x.id === updatedUser.id);
        if (u) {
          Object.assign(u, updatedUser);
          renderMembers();
        }
      }

      // 3. In state.openDms list
      if (state.openDms) {
        const dm = state.openDms.find((x) => x.id === updatedUser.id);
        if (dm) {
          Object.assign(dm, updatedUser);
          renderDmList();
        }
      }

      // 4. In state.friends list
      if (state.friends) {
        const f = state.friends.find((x) => x.friend && x.friend.id === updatedUser.id);
        if (f) {
          Object.assign(f.friend, updatedUser);
          if (state.currentView === 'friends') {
            renderFriendsList(state.friendsTab);
          }
        }
      }

      // 5. In active message stream
      const uname = (updatedUser.username || '').toLowerCase();
      document.querySelectorAll(`.chat-message[data-user-id="${updatedUser.id}"], .chat-message[data-username="${uname}"]`).forEach((msgEl) => {
        const av = msgEl.querySelector('.msg-avatar');
        if (av) {
          setAvatarContent(av, updatedUser);
        }
      });
      refreshVisibleMessageAvatars();

      // 6. If currently open in profile modal
      if (state.activeProfileUser && state.activeProfileUser.id === updatedUser.id) {
        const isEditingBio = state.user && state.user.id === updatedUser.id &&
          el.profileBioEditWrap && !el.profileBioEditWrap.classList.contains('hidden');
        if (!isEditingBio) {
          openUserProfile(
            updatedUser.id,
            updatedUser.username,
            updatedUser.displayName,
            updatedUser.avatarColor,
            updatedUser.role,
            updatedUser.bio !== undefined ? updatedUser.bio : state.activeProfileUser.bio,
            updatedUser.avatarUrl,
            updatedUser.hasMembership !== undefined ? updatedUser.hasMembership : state.activeProfileUser.hasMembership
          );
        } else {
          state.activeProfileUser.bio = updatedUser.bio !== undefined ? updatedUser.bio : state.activeProfileUser.bio;
          state.activeProfileUser.avatarUrl = updatedUser.avatarUrl;
          state.activeProfileUser.displayName = updatedUser.displayName;
          state.activeProfileUser.avatarColor = updatedUser.avatarColor;
          if (updatedUser.hasMembership !== undefined) {
            state.activeProfileUser.hasMembership = Boolean(updatedUser.hasMembership);
          }
        }
      }
    });

    state.socket.on('update_request_created', (newReq) => {
      if (typeof handleUpdateRequestCreated === 'function') {
        handleUpdateRequestCreated(newReq);
      }
    });

    state.socket.on('update_request_updated', (updatedReq) => {
      if (typeof handleUpdateRequestUpdated === 'function') {
        handleUpdateRequestUpdated(updatedReq);
      }
    });

    state.socket.on('update_request_deleted', (payload) => {
      if (typeof handleUpdateRequestDeleted === 'function') {
        handleUpdateRequestDeleted(payload);
      }
    });

    state.socket.on('live_visitor_count', ({ count }) => {
      updateLiveVisitorCount(count);
    });
  }

  function initLiveVisitorCounter() {
    // Initial fetch to display immediately without waiting for socket handshake
    fetch('/api/live-visitors')
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.count === 'number') {
          updateLiveVisitorCount(data.count);
        }
      })
      .catch(() => {});

    // Ensure socket is active for real-time live events
    if (!state.socket) {
      initSocket();
    }
  }

  function updateLiveVisitorCount(count) {
    if (!el.liveVisitorCountText) return;
    const n = Math.max(1, parseInt(count, 10) || 1);
    el.liveVisitorCountText.textContent = `${n} ${n === 1 ? 'person' : 'people'} on site`;
    if (el.liveVisitorCounter) {
      el.liveVisitorCounter.setAttribute(
        'title',
        `${n} active ${n === 1 ? 'user' : 'users'} currently browsing BokitCord`
      );
    }
  }

  // ============================================================================
  // AUTH LOGIC & CHARACTER COUNTERS
  // ============================================================================

  function setupEventListeners() {
    // Auth Tab Switcher
    el.tabBtnLogin.addEventListener('click', () => {
      el.tabBtnLogin.classList.add('active');
      el.tabBtnRegister.classList.remove('active');
      el.formLogin.classList.remove('hidden');
      el.formRegister.classList.add('hidden');
      hideAuthAlert();
    });

    el.tabBtnRegister.addEventListener('click', () => {
      el.tabBtnRegister.classList.add('active');
      el.tabBtnLogin.classList.remove('active');
      el.formRegister.classList.remove('hidden');
      el.formLogin.classList.add('hidden');
      hideAuthAlert();
    });

    // Note for bokit: 200 Char Limit Live Counter
    el.regNote.addEventListener('input', () => {
      const len = el.regNote.value.length;
      el.noteCharCounter.textContent = `${len} / 200`;

      el.noteCharCounter.classList.remove('counter-warn', 'counter-limit');
      if (len >= 200) {
        el.noteCharCounter.classList.add('counter-limit');
      } else if (len >= 170) {
        el.noteCharCounter.classList.add('counter-warn');
      }
    });

    // Login Form Submit
    el.formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAuthAlert();

      const username = el.loginUsername.value.trim();
      const password = el.loginPassword.value;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (res.ok && data.token) {
          state.token = data.token;
          state.user = data.user;
          localStorage.setItem('bokitcord_token', data.token);
          showDiscordView();
          return;
        }

        // Check if account request is Pending
        if (data.status === 'pending') {
          showAuthAlert(
            'pending',
            'Account Request Pending Review',
            `Hi <strong>@${username}</strong>! Your account request was submitted and is currently in <strong>bokit</strong>'s review queue. Once bokit approves it, you will be able to log in right here.` +
              (data.note ? `<div class="auth-alert-quote">Your submitted note: "${escapeHtml(data.note)}"</div>` : '')
          );
          return;
        }

        // Check if account request was Rejected by bokit
        if (data.status === 'rejected') {
          showAuthAlert(
            'rejected',
            'Account Request Declined by bokit',
            `Your account request for <strong>@${username}</strong> was not approved by bokit.` +
              `<div class="auth-alert-quote"><strong>Note from bokit:</strong> "${escapeHtml(data.rejectionNote || 'No specific reason provided.')}"</div>` +
              `<div style="margin-top:8px;"><button type="button" class="btn btn-secondary" id="btn-reapply-link">Click here to re-apply with a new note</button></div>`
          );

          const reapplyBtn = document.getElementById('btn-reapply-link');
          if (reapplyBtn) {
            reapplyBtn.addEventListener('click', () => {
              el.tabBtnRegister.click();
              el.regUsername.value = username;
            });
          }
          return;
        }

        // Generic error
        showAuthAlert('error', 'Login Failed', data.error || 'Invalid credentials.');
      } catch (err) {
        showAuthAlert('error', 'Network Error', 'Could not connect to the server.');
      }
    });

    // Register Form Submit
    el.formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAuthAlert();

      const username = el.regUsername.value.trim();
      const displayName = el.regDisplayname.value.trim();
      const password = el.regPassword.value;
      const note = el.regNote.value.trim();

      if (note.length > 200) {
        showAuthAlert('error', 'Limit Exceeded', 'Your note exceeds the 200 character limit.');
        return;
      }

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, displayName, password, note }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          // Switch back to login tab with clear pending message
          el.tabBtnLogin.click();
          el.loginUsername.value = username;
          el.loginPassword.value = '';

          showAuthAlert(
            'pending',
            'Request Dispatched to bokit!',
            `Awesome, <strong>${escapeHtml(displayName)}</strong>! Your account request has been sent to <strong>bokit</strong> for approval with your note.` +
              (note ? `<div class="auth-alert-quote">Note (${note.length}/200 chars): "${escapeHtml(note)}"</div>` : '') +
              `<p style="margin-top:6px; font-size:12px;">As soon as bokit accepts your request, you can enter your password and log in.</p>`
          );
        } else {
          showAuthAlert('error', 'Registration Failed', data.error || 'Could not submit request.');
        }
      } catch (err) {
        showAuthAlert('error', 'Error', 'Failed to reach registration server.');
      }
    });

    // Logout Button
    el.btnLogout.addEventListener('click', () => {
      localStorage.removeItem('bokitcord_token');
      state.token = null;
      state.user = null;
      state.openDms = [];
      state.currentDmRecipient = null;
      state.unreadDms.clear();
      state.unreadDmCounts = {};
      updateAllDmBadges();
      if (state.socket) state.socket.disconnect();
      showAuthView();
    });

    // Top Navigation / Server Rail
    el.navBtnCommunity.addEventListener('click', () => {
      switchToCommunityView();
    });

    el.navBtnHome.addEventListener('click', () => {
      switchToFriendsView();
    });

    el.btnSidebarFriends.addEventListener('click', () => {
      switchToFriendsView();
    });

    // Admin Modals
    el.navBtnAdmin.addEventListener('click', openAdminRequestsModal);
    el.btnTopbarAdmin.addEventListener('click', openAdminRequestsModal);
    el.btnCloseAdminModal.addEventListener('click', closeAdminRequestsModal);

    el.adminTabPending.addEventListener('click', () => {
      state.activeAdminTab = 'pending';
      el.adminTabPending.classList.add('active');
      el.adminTabHistory.classList.remove('active');
      if (el.adminTabUsers) el.adminTabUsers.classList.remove('active');
      renderAdminRequests('pending');
    });

    el.adminTabHistory.addEventListener('click', () => {
      state.activeAdminTab = 'history';
      el.adminTabHistory.classList.add('active');
      el.adminTabPending.classList.remove('active');
      if (el.adminTabUsers) el.adminTabUsers.classList.remove('active');
      renderAdminRequests('history');
    });

    if (el.adminTabUsers) {
      el.adminTabUsers.addEventListener('click', () => {
        state.activeAdminTab = 'users';
        el.adminTabUsers.classList.add('active');
        el.adminTabPending.classList.remove('active');
        el.adminTabHistory.classList.remove('active');
        renderAdminManageAccounts();
      });
    }

    // Reject Modal
    el.btnCloseRejectModal.addEventListener('click', closeRejectModal);
    el.btnCancelReject.addEventListener('click', closeRejectModal);
    el.btnConfirmReject.addEventListener('click', submitRejection);

    // Telegram E2EE Encryption Modal Listeners
    if (el.btnEncryptionInfo) {
      el.btnEncryptionInfo.addEventListener('click', openEncryptionInfoModal);
    }
    if (el.btnCloseCryptoModal) {
      el.btnCloseCryptoModal.addEventListener('click', closeEncryptionInfoModal);
    }
    if (el.btnDoneCryptoModal) {
      el.btnDoneCryptoModal.addEventListener('click', closeEncryptionInfoModal);
    }

    // Chat Message Send (Encrypted with Telegram-grade AES-256-GCM + Image Attachments)
    let typingHeartbeat = null;
    el.formSendMessage.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Announcements permission enforcement (bokit only)
      if (state.currentView === 'channels' && state.currentChannelId === 'announcements') {
        if (!isUserBokit()) {
          alert('Only administrator bokit can post in #announcements.');
          return;
        }
      }

      const text = el.chatInputText ? el.chatInputText.value.trim() : '';
      const hasStagedImage = Boolean(state.stagedImage);
      if (!text && !hasStagedImage) return;

      if (el.chatInputText) el.chatInputText.value = '';
      hideMentionAutocomplete();

      // Clear typing heartbeat and notify channel that typing stopped
      if (typingHeartbeat) {
        clearInterval(typingHeartbeat);
        typingHeartbeat = null;
      }
      if (state.socket && state.user) {
        state.socket.emit('stop_typing', {
          channelId: state.currentChannelId,
          username: state.user.username,
        });
      }

      let attachmentUrl = null;
      let attachmentName = null;

      if (hasStagedImage) {
        try {
          const uploadRes = await fetch('/api/messages/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`,
            },
            body: JSON.stringify({
              image: state.stagedImage.dataUrl,
              file: state.stagedImage.dataUrl,
              filename: state.stagedImage.name,
            }),
          });
          const uploadData = await uploadRes.json();
          if (uploadData.success && uploadData.url) {
            attachmentUrl = uploadData.url;
            attachmentName = uploadData.filename || state.stagedImage.name;
          } else {
            console.error('Image upload failed:', uploadData.message);
            alert('Failed to upload image: ' + (uploadData.message || 'Unknown error'));
            return;
          }
        } catch (err) {
          console.error('Image upload error:', err);
          alert('Network error while uploading image.');
          return;
        } finally {
          clearStagedImage();
        }
      }

      if (state.socket) {
        let payload = {
          channelId: state.currentChannelId,
          token: state.token,
          attachmentUrl: attachmentUrl || null,
          attachmentName: attachmentName || null,
        };

        if (window.BokitCrypto && text) {
          const enc = await window.BokitCrypto.encryptMessage(state.currentChannelId, text, null);
          payload.ciphertext = enc.ciphertext;
          payload.iv = enc.iv;
          payload.isEncrypted = true;
          payload.encryptionType = enc.encryptionType;
        } else {
          payload.content = text;
        }

        state.socket.emit('send_message', payload);
      }
    });

    // Image Upload & Staging Event Listeners
    if (el.btnAttachImage && el.inputChatImage) {
      el.btnAttachImage.addEventListener('click', () => {
        el.inputChatImage.click();
      });
      el.inputChatImage.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          stageImageFile(e.target.files[0]);
        }
      });
    }

    if (el.btnCancelStagedImage) {
      el.btnCancelStagedImage.addEventListener('click', clearStagedImage);
    }

    // Lightbox Modal Listeners
    if (el.btnCloseLightbox) {
      el.btnCloseLightbox.addEventListener('click', closeLightbox);
    }
    if (el.lightboxBackdrop) {
      el.lightboxBackdrop.addEventListener('click', closeLightbox);
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && el.modalImageLightbox && !el.modalImageLightbox.classList.contains('hidden')) {
        closeLightbox();
      }
    });

    // Paste Image into Chat (Ctrl+V)
    document.addEventListener('paste', (e) => {
      if (state.currentView !== 'channels' && state.currentView !== 'dm' && state.currentView !== 'chat') return;
      const items = (e.clipboardData || e.originalEvent?.clipboardData)?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            stageImageFile(file);
            e.preventDefault();
            break;
          }
        }
      }
    });

    // Drag-and-drop Image Upload onto Chat
    const chatDropTargets = [el.chatInputContainer, el.messageStream].filter(Boolean);
    chatDropTargets.forEach((target) => {
      target.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        target.classList.add('chat-drag-over');
      });
      target.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        target.classList.remove('chat-drag-over');
      });
      target.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        target.classList.remove('chat-drag-over');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          stageImageFile(e.dataTransfer.files[0]);
        }
      });
    });

    // Chat input typing heartbeat & mention autocomplete trigger
    el.chatInputText.addEventListener('input', () => {
      // Trigger Discord-style @everyone autocomplete for bokit account
      checkMentionAutocomplete();

      if (!state.socket || !state.user) return;
      const val = el.chatInputText.value;
      if (!val.trim()) {
        if (typingHeartbeat) {
          clearInterval(typingHeartbeat);
          typingHeartbeat = null;
        }
        state.socket.emit('stop_typing', {
          channelId: state.currentChannelId,
          username: state.user.username,
        });
      } else {
        if (!typingHeartbeat) {
          state.socket.emit('typing', {
            channelId: state.currentChannelId,
            username: state.user.username,
            displayName: state.user.displayName,
          });
          typingHeartbeat = setInterval(() => {
            if (el.chatInputText && el.chatInputText.value.trim() && state.socket && state.user) {
              state.socket.emit('typing', {
                channelId: state.currentChannelId,
                username: state.user.username,
                displayName: state.user.displayName,
              });
            } else {
              clearInterval(typingHeartbeat);
              typingHeartbeat = null;
            }
          }, 2500);
        }
      }
    });

    // Keyboard navigation for mention autocomplete popup (Tab/Enter/Escape)
    el.chatInputText.addEventListener('keydown', (e) => {
      if (el.mentionAutocompletePopup && !el.mentionAutocompletePopup.classList.contains('hidden')) {
        if (e.key === 'Tab' || e.key === 'Enter') {
          e.preventDefault();
          insertEveryoneMention();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          hideMentionAutocomplete();
        }
      }
    });

    // Click item in mention autocomplete popup
    if (el.mentionAutocompleteItemEveryone) {
      el.mentionAutocompleteItemEveryone.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        insertEveryoneMention();
      });
    }

    // Dismiss mention autocomplete popup when clicking outside
    document.addEventListener('click', (e) => {
      if (el.mentionAutocompletePopup && !el.mentionAutocompletePopup.classList.contains('hidden')) {
        if (!el.chatInputContainer || !el.chatInputContainer.contains(e.target)) {
          hideMentionAutocomplete();
        }
      }
    });

    // Toggle Member list
    el.btnToggleMembers.addEventListener('click', () => {
      el.membersSidebar.classList.toggle('hidden');
      el.btnToggleMembers.classList.toggle('active');
    });

    // Friends Subnav
    el.subnavBtnOnline.addEventListener('click', () => switchFriendsTab('online'));
    el.subnavBtnAll.addEventListener('click', () => switchFriendsTab('all'));
    el.subnavBtnPending.addEventListener('click', () => switchFriendsTab('pending'));
    el.subnavBtnAdd.addEventListener('click', () => switchFriendsTab('add'));

    // Add Friend Form (STRICT USERNAME CHECK)
    el.formAddFriend.addEventListener('submit', async (e) => {
      e.preventDefault();
      const targetInput = el.inputFriendUsername.value.trim();
      if (!targetInput) return;

      setAddFriendFeedback('loading', 'Checking username...');

      try {
        const res = await fetch('/api/friends/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${state.token}`,
          },
          body: JSON.stringify({ targetUsername: targetInput }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setAddFriendFeedback('success', `✅ Success! Friend request sent to @${targetInput.replace(/^@/, '')}.`);
          el.inputFriendUsername.value = '';
          loadFriends();
        } else {
          // Display error with specific emphasis on strict username rule
          setAddFriendFeedback('error', `❌ ${data.error || 'Failed to send request.'}`);
        }
      } catch (err) {
        setAddFriendFeedback('error', '❌ Network error while sending friend request.');
      }
    });

    // Profile Modal
    el.btnCloseProfileModal.addEventListener('click', closeProfileModal);
    el.btnCopyUsername.addEventListener('click', () => {
      const rawUser = el.profileModalUsername.textContent.replace('@', '');
      navigator.clipboard.writeText(rawUser).then(() => {
        const span = el.btnCopyUsername.querySelector('span');
        const orig = span.textContent;
        span.textContent = 'Copied!';
        setTimeout(() => (span.textContent = orig), 2000);
      });
    });

    el.btnProfileAddFriend.addEventListener('click', async () => {
      const target = el.profileBtnUsernameTarget.textContent;
      try {
        const res = await fetch('/api/friends/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${state.token}`,
          },
          body: JSON.stringify({ targetUsername: target }),
        });
        const data = await res.json();
        if (res.ok) {
          alert(`Friend request sent to @${target}!`);
          closeProfileModal();
          loadFriends();
        } else {
          alert(data.error || 'Failed to send friend request.');
        }
      } catch (err) {
        alert('Could not send friend request.');
      }
    });

    if (el.btnProfileStartChat) {
      el.btnProfileStartChat.addEventListener('click', () => {
        if (state.activeProfileUser) {
          const target = { ...state.activeProfileUser };
          closeProfileModal();
          openDirectMessage(target);
        }
      });
    }

    // Change Avatar overlay / button
    const triggerAvatarPicker = () => {
      if (el.inputAvatarUpload) {
        el.inputAvatarUpload.value = '';
        el.inputAvatarUpload.click();
      }
    };

    if (el.profileAvatarOverlay) {
      el.profileAvatarOverlay.addEventListener('click', triggerAvatarPicker);
    }
    if (el.btnProfileChangeAvatar) {
      el.btnProfileChangeAvatar.addEventListener('click', triggerAvatarPicker);
    }

    // Avatar file input change handler
    if (el.inputAvatarUpload) {
      el.inputAvatarUpload.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          if (el.profileAvatarStatus) {
            el.profileAvatarStatus.className = 'profile-avatar-status error';
            el.profileAvatarStatus.textContent = '❌ Only PNG, JPEG, GIF, and WebP images are allowed.';
          }
          return;
        }

        const maxBytes = 8 * 1024 * 1024; // 8MB
        if (file.size > maxBytes) {
          if (el.profileAvatarStatus) {
            el.profileAvatarStatus.className = 'profile-avatar-status error';
            el.profileAvatarStatus.textContent = '❌ Image exceeds 8MB size limit.';
          }
          return;
        }

        if (el.profileAvatarStatus) {
          el.profileAvatarStatus.className = 'profile-avatar-status loading';
          el.profileAvatarStatus.textContent = 'Uploading avatar...';
        }

        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const res = await fetch('/api/users/avatar', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${state.token}`,
              },
              body: JSON.stringify({ avatar: reader.result }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
              if (state.user) {
                state.user.avatarUrl = data.avatarUrl;
              }
              setAvatarContent(el.userPanelAvatar, state.user);
              if (el.navbarUserAvatar) {
                setAvatarContent(el.navbarUserAvatar, state.user);
              }
              setAvatarContent(el.profileModalAvatar, state.user);
              if (el.btnProfileRemoveAvatar) {
                el.btnProfileRemoveAvatar.classList.remove('hidden');
              }
              if (el.profileAvatarStatus) {
                el.profileAvatarStatus.className = 'profile-avatar-status success';
                el.profileAvatarStatus.textContent = '✅ Avatar updated successfully!';
                setTimeout(() => {
                  if (el.profileAvatarStatus) el.profileAvatarStatus.textContent = '';
                }, 3000);
              }
            } else {
              if (el.profileAvatarStatus) {
                el.profileAvatarStatus.className = 'profile-avatar-status error';
                el.profileAvatarStatus.textContent = `❌ ${data.error || 'Upload failed.'}`;
              }
            }
          } catch (err) {
            if (el.profileAvatarStatus) {
              el.profileAvatarStatus.className = 'profile-avatar-status error';
              el.profileAvatarStatus.textContent = '❌ Network error during avatar upload.';
            }
          }
        };
        reader.onerror = () => {
          if (el.profileAvatarStatus) {
            el.profileAvatarStatus.className = 'profile-avatar-status error';
            el.profileAvatarStatus.textContent = '❌ Failed to read selected image file.';
          }
        };
        reader.readAsDataURL(file);
      });
    }

    // Remove Avatar button handler
    if (el.btnProfileRemoveAvatar) {
      el.btnProfileRemoveAvatar.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to remove your custom avatar and revert to the default?')) {
          return;
        }

        if (el.profileAvatarStatus) {
          el.profileAvatarStatus.className = 'profile-avatar-status loading';
          el.profileAvatarStatus.textContent = 'Removing avatar...';
        }

        try {
          const res = await fetch('/api/users/avatar', {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${state.token}`,
            },
          });

          const data = await res.json();
          if (res.ok && data.success) {
            if (state.user) {
              state.user.avatarUrl = null;
            }
            setAvatarContent(el.userPanelAvatar, state.user);
            if (el.navbarUserAvatar) {
              setAvatarContent(el.navbarUserAvatar, state.user);
            }
            setAvatarContent(el.profileModalAvatar, state.user);
            el.btnProfileRemoveAvatar.classList.add('hidden');
            if (el.profileAvatarStatus) {
              el.profileAvatarStatus.className = 'profile-avatar-status success';
              el.profileAvatarStatus.textContent = '✅ Avatar removed.';
              setTimeout(() => {
                if (el.profileAvatarStatus) el.profileAvatarStatus.textContent = '';
              }, 3000);
            }
          } else {
            if (el.profileAvatarStatus) {
              el.profileAvatarStatus.className = 'profile-avatar-status error';
              el.profileAvatarStatus.textContent = `❌ ${data.error || 'Failed to remove avatar.'}`;
            }
          }
        } catch (err) {
          if (el.profileAvatarStatus) {
            el.profileAvatarStatus.className = 'profile-avatar-status error';
            el.profileAvatarStatus.textContent = '❌ Network error while removing avatar.';
          }
        }
      });
    }

    // Open self profile by clicking bottom user panel avatar/info or top navbar user chip
    const openSelfProfile = () => {
      if (!state.user) return;
      openUserProfile(
        state.user.id,
        state.user.username,
        state.user.displayName,
        state.user.avatarColor,
        state.user.role,
        state.user.bio,
        state.user.avatarUrl
      );
    };

    if (el.userPanelAvatar) {
      el.userPanelAvatar.addEventListener('click', openSelfProfile);
    }
    const userPanelInfo = document.querySelector('.user-panel .user-info');
    if (userPanelInfo) {
      userPanelInfo.addEventListener('click', openSelfProfile);
    }
    if (el.navbarUserChip) {
      el.navbarUserChip.addEventListener('click', openSelfProfile);
    }

    // Bio editing event listeners and handlers
    const cancelBioEdit = () => {
      if (el.profileBioEditWrap) el.profileBioEditWrap.classList.add('hidden');
      if (el.profileModalBio) el.profileModalBio.classList.remove('hidden');
      if (el.profileBioStatus) {
        el.profileBioStatus.textContent = '';
        el.profileBioStatus.className = 'profile-bio-status';
      }
    };

    const updateBioCharCount = () => {
      if (!el.inputProfileBio || !el.bioCharCount) return;
      const len = el.inputProfileBio.value.length;
      el.bioCharCount.textContent = `${len}/200`;
      el.bioCharCount.classList.toggle('warning', len >= 200);
    };

    const saveUserBio = async () => {
      if (!state.user || !state.token) return;
      const targetUser = state.activeProfileUser || state.user;
      const isEditingOther = targetUser && state.user && targetUser.id !== state.user.id;
      const newBio = el.inputProfileBio ? el.inputProfileBio.value.trim() : '';

      if (newBio.length > 200) {
        if (el.profileBioStatus) {
          el.profileBioStatus.className = 'profile-bio-status error';
          el.profileBioStatus.textContent = '❌ Bio cannot exceed 200 characters.';
        }
        return;
      }

      if (el.profileBioStatus) {
        el.profileBioStatus.className = 'profile-bio-status loading';
        el.profileBioStatus.textContent = 'Saving bio...';
      }
      if (el.btnSaveBio) el.btnSaveBio.disabled = true;
      if (el.btnCancelBio) el.btnCancelBio.disabled = true;
      if (el.inputProfileBio) el.inputProfileBio.disabled = true;

      try {
        const endpoint = isEditingOther && targetUser
          ? `/api/admin/users/${encodeURIComponent(targetUser.id)}/bio`
          : '/api/users/bio';

        const res = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${state.token}`,
          },
          body: JSON.stringify({ bio: newBio, userId: targetUser ? targetUser.id : undefined }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          const updatedBio = data.bio !== undefined ? data.bio : newBio;
          if (targetUser) {
            targetUser.bio = updatedBio;
          }
          if (!isEditingOther && state.user) {
            state.user.bio = updatedBio;
          }
          // Update in state.users list
          if (targetUser) {
            const uIdx = (state.users || []).findIndex((u) => u.id === targetUser.id);
            if (uIdx !== -1) {
              state.users[uIdx].bio = updatedBio;
            }
          }
          if (el.profileModalBio) {
            el.profileModalBio.textContent = updatedBio || 'No bio provided.';
            el.profileModalBio.classList.remove('hidden');
          }
          if (el.profileBioEditWrap) {
            el.profileBioEditWrap.classList.add('hidden');
          }
          if (el.profileBioStatus) {
            el.profileBioStatus.className = 'profile-bio-status success';
            el.profileBioStatus.textContent = isEditingOther
              ? `✅ Bio updated for @${targetUser.username}!`
              : '✅ About Me updated!';
            setTimeout(() => {
              if (el.profileBioStatus && el.profileBioStatus.classList.contains('success')) {
                el.profileBioStatus.textContent = '';
              }
            }, 3000);
          }
          // If Manage Accs tab is open in admin modal, refresh it
          if (state.activeAdminTab === 'users' && el.modalAdminRequests && !el.modalAdminRequests.classList.contains('hidden')) {
            renderAdminManageAccounts();
          }
        } else {
          if (el.profileBioStatus) {
            el.profileBioStatus.className = 'profile-bio-status error';
            el.profileBioStatus.textContent = `❌ ${data.error || 'Failed to update bio.'}`;
          }
        }
      } catch (err) {
        console.error('Save bio error:', err);
        if (el.profileBioStatus) {
          el.profileBioStatus.className = 'profile-bio-status error';
          el.profileBioStatus.textContent = `❌ ${err.message || 'Error saving bio.'}`;
        }
      } finally {
        if (el.btnSaveBio) el.btnSaveBio.disabled = false;
        if (el.btnCancelBio) el.btnCancelBio.disabled = false;
        if (el.inputProfileBio) el.inputProfileBio.disabled = false;
      }
    };

    if (el.btnEditBio) {
      el.btnEditBio.addEventListener('click', () => {
        if (!state.user) return;
        const targetUser = state.activeProfileUser || state.user;
        if (el.profileModalBio) el.profileModalBio.classList.add('hidden');
        if (el.profileBioEditWrap) el.profileBioEditWrap.classList.remove('hidden');
        if (el.inputProfileBio) {
          el.inputProfileBio.value = (targetUser && targetUser.bio !== undefined)
            ? targetUser.bio
            : ((state.user && state.user.bio) || '');
          el.inputProfileBio.placeholder = targetUser && targetUser.id !== state.user.id
            ? `Update About Me for @${targetUser.username} (max 200 characters)...`
            : 'Tell everyone about yourself (max 200 characters)...';
          updateBioCharCount();
          el.inputProfileBio.focus();
        }
        if (el.profileBioStatus) {
          el.profileBioStatus.textContent = '';
          el.profileBioStatus.className = 'profile-bio-status';
        }
      });
    }

    if (el.inputProfileBio) {
      el.inputProfileBio.addEventListener('input', updateBioCharCount);
      el.inputProfileBio.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          saveUserBio();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cancelBioEdit();
        }
      });
    }

    if (el.btnCancelBio) {
      el.btnCancelBio.addEventListener('click', cancelBioEdit);
    }

    if (el.btnSaveBio) {
      el.btnSaveBio.addEventListener('click', saveUserBio);
    }

    // Name Change Event Listeners in User Profile Modal
    if (el.btnToggleNameEdit) {
      el.btnToggleNameEdit.addEventListener('click', () => {
        if (!el.profileNameEditForm) return;
        const isHidden = el.profileNameEditForm.classList.contains('hidden');
        if (isHidden) {
          el.profileNameEditForm.classList.remove('hidden');
          if (el.nameEditToggleLabel) el.nameEditToggleLabel.textContent = 'Close Form';
          if (el.inputEditDisplayName) el.inputEditDisplayName.focus();
        } else {
          el.profileNameEditForm.classList.add('hidden');
          if (el.nameEditToggleLabel) el.nameEditToggleLabel.textContent = 'Change Name';
        }
      });
    }

    if (el.btnCancelNameEdit) {
      el.btnCancelNameEdit.addEventListener('click', () => {
        if (el.profileNameEditForm) el.profileNameEditForm.classList.add('hidden');
        if (el.nameEditToggleLabel) el.nameEditToggleLabel.textContent = 'Change Name';
        if (el.profileNameFeedback) {
          el.profileNameFeedback.textContent = '';
          el.profileNameFeedback.className = 'profile-name-feedback';
        }
      });
    }

    if (el.btnSaveNameEdit) {
      el.btnSaveNameEdit.addEventListener('click', saveNameChange);
    }

    // Non-Admin Self Profile: Stop Ads ($5/Monthly) Button
    if (el.btnProfileStopAds) {
      el.btnProfileStopAds.addEventListener('click', () => {
        if (el.profileStopAdsNotice) {
          el.profileStopAdsNotice.classList.toggle('hidden');
        }
      });
    }

    // Bokit-Only No-Ads Membership Toggle Button in User Profile Modal
    if (el.btnProfileToggleMembership) {
      el.btnProfileToggleMembership.addEventListener('click', async () => {
        if (!state.activeProfileUser || !isUserBokit()) return;
        await toggleUserMembership(state.activeProfileUser);
      });
    }

    // Admin Role Toggle Button in User Profile Modal
    if (el.btnProfileToggleAdmin) {
      el.btnProfileToggleAdmin.addEventListener('click', async () => {
        if (!state.activeProfileUser || !isUserBokit()) return;
        const target = state.activeProfileUser;
        const isCurrentlyAdmin = target.role === 'admin';
        const newRole = isCurrentlyAdmin ? 'user' : 'admin';
        const actionWord = isCurrentlyAdmin
          ? `Revoke administrator privileges from @${target.username} (${target.displayName})?`
          : `Grant administrator privileges to @${target.username} (${target.displayName})?`;

        if (!confirm(actionWord)) return;

        try {
          el.btnProfileToggleAdmin.disabled = true;
          const res = await fetch(`/api/admin/users/${encodeURIComponent(target.id)}/role`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${state.token}`,
            },
            body: JSON.stringify({ role: newRole }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            target.role = newRole;
            const u = (state.users || []).find((x) => x.id === target.id);
            if (u) u.role = newRole;

            el.profileBadgeRole.textContent = newRole === 'admin' ? 'ADMIN' : 'MEMBER';
            el.profileBadgeRole.className = 'badge-role';
            if (newRole === 'admin') {
              el.profileBadgeRole.classList.add('admin');
              el.profileBtnAdminText.textContent = 'Revoke Admin Role';
              el.btnProfileToggleAdmin.className = 'btn btn-secondary btn-block';
            } else {
              el.profileBtnAdminText.textContent = 'Grant Admin Role';
              el.btnProfileToggleAdmin.className = 'btn btn-blurple btn-block';
            }
            renderMembers();
            if (state.activeAdminTab === 'users' && el.modalAdminRequests && !el.modalAdminRequests.classList.contains('hidden')) {
              renderAdminManageAccounts();
            }
          } else {
            alert(data.error || 'Failed to update user role.');
          }
        } catch (err) {
          console.error('Toggle admin role error:', err);
          alert('Network error while updating user role.');
        } finally {
          el.btnProfileToggleAdmin.disabled = false;
        }
      });
    }

    // Admin Delete User Button in User Profile Modal
    if (el.btnProfileDeleteUser) {
      el.btnProfileDeleteUser.addEventListener('click', async () => {
        if (!state.activeProfileUser || !isUserBokit()) return;
        const target = state.activeProfileUser;
        await deleteUserAccount(target);
        closeProfileModal();
      });
    }
  }

  function showAuthAlert(type, title, messageHtml) {
    el.authAlert.className = `auth-alert alert-${type}`;
    el.authAlertContent.innerHTML = `<strong>${title}</strong>${messageHtml}`;
    el.authAlert.classList.remove('hidden');
  }

  function hideAuthAlert() {
    el.authAlert.classList.add('hidden');
    el.authAlertContent.innerHTML = '';
  }

  // ============================================================================
  // CHANNELS & MESSAGES LOGIC
  // ============================================================================

  async function loadChannels() {
    try {
      const res = await fetch('/api/channels');
      state.channels = await res.json();
      renderChannels();
      if (state.channels.length > 0) {
        selectChannel(state.channels[0].id);
      }
    } catch (err) {
      console.error('Channels load error:', err);
    }
  }

  function renderChannels() {
    el.channelList.innerHTML = '';
    state.channels.forEach((ch) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.className = `channel-item ${state.currentView === 'channels' && ch.id === state.currentChannelId ? 'active' : ''}`;
      btn.innerHTML = `<span class="channel-hash">#</span><span>${escapeHtml(ch.name)}</span>`;
      btn.addEventListener('click', () => selectChannel(ch.id));
      li.appendChild(btn);
      el.channelList.appendChild(li);
    });
  }

  function selectChannel(channelId) {
    if (state.socket && state.currentChannelId !== channelId) {
      state.socket.emit('leave_channel', { channelId: state.currentChannelId });
    }

    state.currentChannelId = channelId;
    switchToCommunityView();

    if (state.socket) {
      state.socket.emit('join_channel', { channelId });
    }

    updateChatInputPermissions();
    updateTypingIndicatorDisplay();
    loadMessages(channelId);
  }

  async function loadMessages(channelId) {
    el.messageStream.innerHTML = '';
    try {
      const res = await fetch(`/api/messages/${channelId}`);
      const messages = await res.json();
      const ch = state.channels.find((c) => c.id === channelId) || { name: channelId, topic: '' };

      if (!messages || messages.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-channel-state';
        emptyState.innerHTML = `
          <div class="empty-channel-icon">#</div>
          <h2 class="empty-channel-title">Welcome to #${escapeHtml(ch.name)}!</h2>
          <p class="empty-channel-sub">This is the start of the #${escapeHtml(ch.name)} channel. Be the first to send a message!</p>
          <div class="empty-channel-meta">
            <span class="meta-pill">AES-256-GCM E2EE Active</span>
            <span class="meta-pill">Zero Default Messages</span>
          </div>
        `;
        el.messageStream.appendChild(emptyState);
      } else {
        for (const rawMsg of messages) {
          const preparedMsg = await decryptIfNeeded(rawMsg);
          appendMessage(preparedMsg);
        }
        refreshVisibleMessageAvatars();
      }
      scrollToBottom();
    } catch (err) {
      console.error('Load messages error:', err);
    }
  }

  async function decryptIfNeeded(msg) {
    if (msg.isEncrypted && window.BokitCrypto) {
      const dec = await window.BokitCrypto.decryptMessage(msg.channelId, msg);
      return {
        ...msg,
        content: dec.content,
        embed: dec.embed,
        isEncrypted: true,
        verified: dec.verified,
      };
    }
    return msg;
  }

  function appendMessage(msg) {
    if (!msg || !msg.id) return;
    if (document.getElementById(`msg-${msg.id}`)) {
      return;
    }

    const emptyState = el.messageStream.querySelector('.empty-channel-state');
    if (emptyState) {
      emptyState.remove();
    }

    const isBokit = msg.username && msg.username.toLowerCase() === 'bokit';
    const isBot = msg.role === 'bot';

    const msgEl = document.createElement('div');
    msgEl.className = 'chat-message';
    if (msg.content && msg.content.includes('@everyone')) {
      msgEl.classList.add('mentioned');
    }
    msgEl.id = `msg-${msg.id}`;
    if (msg.userId) {
      msgEl.dataset.userId = msg.userId;
    }
    if (msg.username) {
      msgEl.dataset.username = msg.username.toLowerCase();
    }

    // Resolve author's current profile from state so messages always reflect their latest avatar
    const authorUser = (state.user && (state.user.id === msg.userId || (msg.username && state.user.username.toLowerCase() === msg.username.toLowerCase())))
      ? state.user
      : (state.users || []).find((u) => u.id === msg.userId || (u.username && msg.username && u.username.toLowerCase() === msg.username.toLowerCase()));

    const effectiveAvatarUrl = (authorUser && authorUser.avatarUrl !== undefined) ? authorUser.avatarUrl : (msg.avatarUrl || null);
    const effectiveDisplayName = (authorUser && authorUser.displayName) || msg.displayName || msg.username;
    const effectiveAvatarColor = (authorUser && authorUser.avatarColor) || msg.avatarColor || '#5865F2';

    const avatarData = {
      ...msg,
      avatarUrl: effectiveAvatarUrl,
      displayName: effectiveDisplayName,
      avatarColor: effectiveAvatarColor,
    };

    // Avatar
    const avatarEl = document.createElement('div');
    avatarEl.className = 'msg-avatar';
    setAvatarContent(avatarEl, avatarData);
    avatarEl.addEventListener('click', () => openUserProfile(msg.userId, msg.username, effectiveDisplayName, effectiveAvatarColor, msg.role, null, effectiveAvatarUrl));

    // Content wrap
    const contentWrap = document.createElement('div');
    contentWrap.className = 'msg-content-wrap';

    // Header
    const headerEl = document.createElement('div');
    headerEl.className = 'msg-header';

    const nameEl = document.createElement('span');
    nameEl.className = 'msg-displayname';
    nameEl.textContent = effectiveDisplayName;
    nameEl.addEventListener('click', () => openUserProfile(msg.userId, msg.username, effectiveDisplayName, effectiveAvatarColor, msg.role, null, effectiveAvatarUrl));

    const usernameTag = document.createElement('span');
    usernameTag.className = 'msg-username-tag';
    usernameTag.textContent = `@${msg.username}`;

    headerEl.appendChild(nameEl);
    headerEl.appendChild(usernameTag);

    if (isBokit || msg.role === 'admin') {
      const adminBadge = document.createElement('span');
      adminBadge.className = 'role-badge admin';
      adminBadge.textContent = 'ADMIN';
      headerEl.appendChild(adminBadge);
    } else if (isBot) {
      const botBadge = document.createElement('span');
      botBadge.className = 'role-badge bot';
      botBadge.textContent = 'SYSTEM';
      headerEl.appendChild(botBadge);
    }

    const timeEl = document.createElement('span');
    timeEl.className = 'msg-timestamp';
    timeEl.textContent = formatTimestamp(msg.createdAt);
    headerEl.appendChild(timeEl);

    // Telegram-style Padlock E2EE Indicator
    if (msg.isEncrypted) {
      const encBadge = document.createElement('span');
      encBadge.className = 'msg-encrypted-badge';
      encBadge.title = 'Telegram-grade End-to-End Encrypted (AES-256-GCM)';
      encBadge.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg> <span>E2EE</span>`;
      headerEl.appendChild(encBadge);
    }

    contentWrap.appendChild(headerEl);

    // Text content
    if (msg.content) {
      const textEl = document.createElement('div');
      textEl.className = 'msg-text';
      textEl.innerHTML = parseSimpleMarkdown(msg.content);
      contentWrap.appendChild(textEl);
    }

    // Attachment image rendering
    if (msg.attachmentUrl) {
      const attachWrap = document.createElement('div');
      attachWrap.className = 'msg-attachment-wrap';
      const img = document.createElement('img');
      img.className = 'msg-attachment-img';
      img.src = msg.attachmentUrl;
      img.alt = msg.attachmentName || 'Attached image';
      img.loading = 'lazy';
      img.title = 'Click to enlarge image';
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        openLightbox(msg.attachmentUrl, msg.attachmentName || 'Attached Image');
      });
      attachWrap.appendChild(img);
      contentWrap.appendChild(attachWrap);
    }

    // Embed card rendering
    if (msg.embed) {
      const embedCard = renderEmbedCard(msg.embed);
      contentWrap.appendChild(embedCard);
    }

    msgEl.appendChild(avatarEl);
    msgEl.appendChild(contentWrap);

    // Message Action Toolbar (Delete Message for Bokit Admin or message author)
    const isCurrentUserBokit = state.user && (state.user.username.toLowerCase() === 'bokit' || state.user.role === 'admin' || state.user.id === 'admin-bokit-id');
    const isAuthor = state.user && (state.user.id === msg.userId);

    if (isCurrentUserBokit || isAuthor) {
      const actionsEl = document.createElement('div');
      actionsEl.className = 'msg-actions';

      const delBtn = document.createElement('button');
      delBtn.className = 'msg-action-btn msg-delete-btn';
      delBtn.title = 'Delete Message';
      delBtn.setAttribute('aria-label', 'Delete Message');
      delBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this message?')) {
          deleteMessage(msg.id);
        }
      });

      actionsEl.appendChild(delBtn);
      msgEl.appendChild(actionsEl);
    }

    el.messageStream.appendChild(msgEl);
  }

  async function deleteMessage(messageId) {
    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete message.');
        return;
      }
      removeMessageFromStream(messageId);
    } catch (err) {
      console.error('Delete message error:', err);
      alert('Error deleting message.');
    }
  }

  function removeMessageFromStream(messageId) {
    const elMsgs = document.querySelectorAll(`[id="msg-${CSS.escape(messageId)}"]`);
    elMsgs.forEach((elMsg) => elMsg.remove());
    const remaining = el.messageStream.querySelectorAll('.chat-message');
    if (remaining.length === 0) {
      if (el.messageStream.querySelector('.empty-channel-state')) {
        return;
      }
      if (state.currentView === 'dm' && state.currentDmRecipient) {
        const targetUser = state.currentDmRecipient;
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-channel-state';
        emptyState.innerHTML = `
          <div class="empty-channel-icon" style="${targetUser.avatarUrl ? `background-image: url('${targetUser.avatarUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat; background-color: transparent;` : `background-color: ${targetUser.avatarColor || '#5865F2'}; color:#ffffff; font-size:30px; display:flex; align-items:center; justify-content:center; font-weight:700;`} border-radius:50%; width:68px; height:68px; margin:0 auto 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.35);">
            ${targetUser.avatarUrl ? '' : escapeHtml((targetUser.displayName || targetUser.username).charAt(0).toUpperCase())}
          </div>
          <h2 class="empty-channel-title" style="font-size:24px; font-weight:700;">${escapeHtml(targetUser.displayName || targetUser.username)}</h2>
          <p class="empty-channel-sub">This is the start of your direct message history with <strong>@${escapeHtml(targetUser.username)}</strong>.</p>
          <div class="empty-channel-meta">
            <span class="meta-pill">AES-256-GCM E2EE Active</span>
            <span class="meta-pill">Direct Message</span>
          </div>
        `;
        el.messageStream.appendChild(emptyState);
      } else {
        const ch = state.channels.find((c) => c.id === state.currentChannelId) || { name: state.currentChannelId, topic: '' };
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-channel-state';
        emptyState.innerHTML = `
          <div class="empty-channel-icon">#</div>
          <h2 class="empty-channel-title">Welcome to #${escapeHtml(ch.name)}!</h2>
          <p class="empty-channel-sub">This is the start of the #${escapeHtml(ch.name)} channel. Be the first to send a message!</p>
          <div class="empty-channel-meta">
            <span class="meta-pill">AES-256-GCM E2EE Active</span>
            <span class="meta-pill">Zero Default Messages</span>
          </div>
        `;
        el.messageStream.appendChild(emptyState);
      }
    }
  }

  // ============================================================================
  // RICH EMBED RENDERING ENGINE
  // ============================================================================

  function renderEmbedCard(embed) {
    const card = document.createElement('div');
    card.className = 'discord-embed';
    card.style.borderLeftColor = embed.color || '#5865F2';

    const grid = document.createElement('div');
    grid.className = 'embed-grid';

    // Author
    if (embed.author && embed.author.name) {
      const authorEl = document.createElement('div');
      authorEl.className = 'embed-author-row';
      authorEl.textContent = embed.author.name;
      grid.appendChild(authorEl);
    }

    // Title
    if (embed.title) {
      const titleEl = document.createElement('div');
      titleEl.className = 'embed-title';
      if (embed.url) {
        titleEl.innerHTML = `<a href="${escapeHtml(embed.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(embed.title)}</a>`;
      } else {
        titleEl.textContent = embed.title;
      }
      grid.appendChild(titleEl);
    }

    // Description
    if (embed.description) {
      const descEl = document.createElement('div');
      descEl.className = 'embed-description';
      descEl.innerHTML = parseSimpleMarkdown(embed.description);
      grid.appendChild(descEl);
    }

    // Fields
    if (Array.isArray(embed.fields) && embed.fields.length > 0) {
      const fieldsGrid = document.createElement('div');
      fieldsGrid.className = 'embed-fields-grid';

      embed.fields.forEach((f) => {
        const col = document.createElement('div');
        col.className = `embed-field-col ${f.inline ? '' : 'full-width'}`;

        const fName = document.createElement('div');
        fName.className = 'embed-field-name';
        fName.textContent = f.name;

        const fVal = document.createElement('div');
        fVal.className = 'embed-field-value';
        fVal.innerHTML = parseSimpleMarkdown(f.value);

        col.appendChild(fName);
        col.appendChild(fVal);
        fieldsGrid.appendChild(col);
      });

      grid.appendChild(fieldsGrid);
    }

    // Banner Image
    if (embed.imageUrl) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'embed-banner-wrap';
      const img = document.createElement('img');
      img.src = embed.imageUrl;
      img.alt = 'Embed Image';
      img.loading = 'lazy';
      imgWrap.appendChild(img);
      grid.appendChild(imgWrap);
    }

    // Footer
    if (embed.footer && embed.footer.text) {
      const footEl = document.createElement('div');
      footEl.className = 'embed-footer-row';
      footEl.textContent = embed.footer.text;
      grid.appendChild(footEl);
    }

    card.appendChild(grid);

    // Thumbnail
    if (embed.thumbnailUrl) {
      const thumbWrap = document.createElement('div');
      thumbWrap.className = 'embed-thumb-wrap';
      const thumbImg = document.createElement('img');
      thumbImg.src = embed.thumbnailUrl;
      thumbImg.alt = 'Thumbnail';
      thumbImg.loading = 'lazy';
      thumbWrap.appendChild(thumbImg);
      card.appendChild(thumbWrap);
    }

    return card;
  }

  // ============================================================================
  // RICH EMBED GENERATOR & LIVE PREVIEW MODAL
  // ============================================================================

  function setupEmbedBuilderListeners() {
    el.btnOpenEmbedModal.addEventListener('click', openEmbedModal);
    el.btnCloseEmbedModal.addEventListener('click', closeEmbedModal);
    el.btnCancelEmbed.addEventListener('click', closeEmbedModal);

    // Color Swatches
    document.querySelectorAll('.color-dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        document.querySelectorAll('.color-dot').forEach((d) => d.classList.remove('active'));
        dot.classList.add('active');
        state.embedDraft.color = dot.dataset.color;
        el.embedCustomColor.value = dot.dataset.color;
        updateEmbedPreview();
      });
    });

    el.embedCustomColor.addEventListener('input', (e) => {
      document.querySelectorAll('.color-dot').forEach((d) => d.classList.remove('active'));
      state.embedDraft.color = e.target.value;
      updateEmbedPreview();
    });

    // Inputs live update
    const updatePreviewOnInput = () => {
      state.embedDraft.title = el.embedTitle.value.trim();
      state.embedDraft.url = el.embedUrl.value.trim();
      state.embedDraft.description = el.embedDesc.value.trim();
      state.embedDraft.author = el.embedAuthor.value.trim();
      state.embedDraft.footer = el.embedFooter.value.trim();
      state.embedDraft.imageUrl = el.embedImg.value.trim();
      state.embedDraft.thumbnailUrl = el.embedThumb.value.trim();
      updateEmbedPreview();
    };

    el.embedTitle.addEventListener('input', updatePreviewOnInput);
    el.embedUrl.addEventListener('input', updatePreviewOnInput);
    el.embedDesc.addEventListener('input', updatePreviewOnInput);
    el.embedAuthor.addEventListener('input', updatePreviewOnInput);
    el.embedFooter.addEventListener('input', updatePreviewOnInput);
    el.embedImg.addEventListener('input', updatePreviewOnInput);
    el.embedThumb.addEventListener('input', updatePreviewOnInput);

    // Add Field
    el.btnAddEmbedField.addEventListener('click', () => {
      addEmbedFieldRow('', '', true);
      updateEmbedPreview();
    });

    // Send Embed Button
    el.btnSendEmbed.addEventListener('click', async () => {
      if (!state.embedDraft.title && !state.embedDraft.description && !state.embedDraft.imageUrl) {
        alert('Please fill in at least an embed Title, Description, or Banner Image.');
        return;
      }

      // Collect fields
      const fields = [];
      document.querySelectorAll('.field-edit-row').forEach((row) => {
        const nameInput = row.querySelector('.field-name-input');
        const valInput = row.querySelector('.field-val-input');
        const inlineCheck = row.querySelector('.field-inline-input');
        if (nameInput.value.trim() || valInput.value.trim()) {
          fields.push({
            name: nameInput.value.trim() || 'Field',
            value: valInput.value.trim() || 'Value',
            inline: inlineCheck.checked,
          });
        }
      });

      const payload = {
        title: state.embedDraft.title,
        url: state.embedDraft.url,
        description: state.embedDraft.description,
        color: state.embedDraft.color,
        author: state.embedDraft.author ? { name: state.embedDraft.author } : null,
        footer: state.embedDraft.footer ? { text: state.embedDraft.footer } : null,
        imageUrl: state.embedDraft.imageUrl,
        thumbnailUrl: state.embedDraft.thumbnailUrl,
        fields,
      };

      if (state.socket) {
        let sendData = {
          channelId: state.currentChannelId,
          token: state.token,
        };

        if (window.BokitCrypto) {
          const enc = await window.BokitCrypto.encryptMessage(state.currentChannelId, '', payload);
          sendData.ciphertext = enc.ciphertext;
          sendData.iv = enc.iv;
          sendData.isEncrypted = true;
          sendData.encryptionType = enc.encryptionType;
        } else {
          sendData.content = '';
          sendData.embed = payload;
        }

        state.socket.emit('send_message', sendData);
      }

      closeEmbedModal();
    });
  }

  function openEmbedModal() {
    el.modalEmbedBuilder.classList.remove('hidden');
    // Prepopulate with a cool sample if empty
    if (!el.embedTitle.value && !el.embedDesc.value) {
      el.embedTitle.value = 'Rich Embed Demo';
      el.embedDesc.value = 'This is a **Discord-style rich embed** crafted inside BokitCord!';
      el.embedAuthor.value = state.user.displayName;
      el.embedFooter.value = 'BokitCord • Embeds Work!';
      el.embedFieldsContainer.innerHTML = '';
      addEmbedFieldRow('Feature', 'Custom Colors & Markdown', true);
      addEmbedFieldRow('Admin Review', 'Curated by @bokit', true);
    }
    updateEmbedPreview();
  }

  function closeEmbedModal() {
    el.modalEmbedBuilder.classList.add('hidden');
  }

  function addEmbedFieldRow(name = '', val = '', inline = true) {
    const row = document.createElement('div');
    row.className = 'field-edit-row';

    row.innerHTML = `
      <input type="text" class="field-name-input" placeholder="Field Title" value="${escapeHtml(name)}" />
      <input type="text" class="field-val-input" placeholder="Field Value" value="${escapeHtml(val)}" />
      <label class="field-inline-checkbox">
        <input type="checkbox" class="field-inline-input" ${inline ? 'checked' : ''} />
        <span>Inline</span>
      </label>
      <button type="button" class="btn-text-action" style="color:var(--status-red);">&times;</button>
    `;

    const removeBtn = row.querySelector('.btn-text-action');
    removeBtn.addEventListener('click', () => {
      row.remove();
      updateEmbedPreview();
    });

    row.querySelectorAll('input').forEach((inp) => {
      inp.addEventListener('input', updateEmbedPreview);
    });

    el.embedFieldsContainer.appendChild(row);
  }

  function updateEmbedPreview() {
    const color = state.embedDraft.color || '#5865F2';
    el.embedLiveCard.style.borderLeftColor = color;

    // Author
    const author = el.embedAuthor.value.trim();
    if (author) {
      el.previewAuthorRow.classList.remove('hidden');
      el.previewAuthorText.textContent = author;
    } else {
      el.previewAuthorRow.classList.add('hidden');
    }

    // Title
    const title = el.embedTitle.value.trim();
    const url = el.embedUrl.value.trim();
    if (title) {
      el.previewTitleRow.classList.remove('hidden');
      el.previewTitleLink.textContent = title;
      el.previewTitleLink.href = url || '#';
    } else {
      el.previewTitleRow.classList.add('hidden');
    }

    // Description
    const desc = el.embedDesc.value.trim();
    if (desc) {
      el.previewDesc.classList.remove('hidden');
      el.previewDesc.innerHTML = parseSimpleMarkdown(desc);
    } else {
      el.previewDesc.classList.add('hidden');
    }

    // Fields
    el.previewFieldsGrid.innerHTML = '';
    let hasFields = false;
    document.querySelectorAll('.field-edit-row').forEach((row) => {
      const fName = row.querySelector('.field-name-input').value.trim();
      const fVal = row.querySelector('.field-val-input').value.trim();
      const isInline = row.querySelector('.field-inline-input').checked;

      if (fName || fVal) {
        hasFields = true;
        const col = document.createElement('div');
        col.className = `embed-field-col ${isInline ? '' : 'full-width'}`;
        col.innerHTML = `
          <div class="embed-field-name">${escapeHtml(fName || 'Field')}</div>
          <div class="embed-field-value">${parseSimpleMarkdown(fVal || 'Value')}</div>
        `;
        el.previewFieldsGrid.appendChild(col);
      }
    });
    if (hasFields) {
      el.previewFieldsGrid.classList.remove('hidden');
    } else {
      el.previewFieldsGrid.classList.add('hidden');
    }

    // Banner Image
    const banner = el.embedImg.value.trim();
    if (banner) {
      el.previewBannerWrap.classList.remove('hidden');
      el.previewBannerImg.src = banner;
    } else {
      el.previewBannerWrap.classList.add('hidden');
    }

    // Thumbnail
    const thumb = el.embedThumb.value.trim();
    if (thumb) {
      el.previewThumbWrap.classList.remove('hidden');
      el.previewThumbImg.src = thumb;
    } else {
      el.previewThumbWrap.classList.add('hidden');
    }

    // Footer
    const footer = el.embedFooter.value.trim();
    if (footer) {
      el.previewFooterRow.classList.remove('hidden');
      el.previewFooterText.textContent = footer;
    } else {
      el.previewFooterRow.classList.add('hidden');
    }
  }

  // ============================================================================
  // BOKIT ADMIN APPROVAL WORKFLOW
  // ============================================================================

  async function fetchAdminRequests() {
    if (!state.user || state.user.username.toLowerCase() !== 'bokit') return;
    try {
      const res = await fetch('/api/admin/requests', {
        headers: { Authorization: `Bearer ${state.token}` },
      });
      if (res.ok) {
        state.requests = await res.json();
        updateAdminBadges();
      }
    } catch (err) {
      console.error('Fetch requests error:', err);
    }
  }

  function updateAdminBadges() {
    const pendingCount = state.requests.filter((r) => r.status === 'pending').length;
    if (pendingCount > 0) {
      el.adminBadgeCount.textContent = pendingCount;
      el.adminBadgeCount.classList.remove('hidden');
      el.adminBadgeCountTop.textContent = pendingCount;
      el.btnTopbarAdmin.classList.remove('hidden');
    } else {
      el.adminBadgeCount.classList.add('hidden');
      el.adminBadgeCountTop.textContent = '0';
    }
  }

  function showAdminNotificationBadge() {
    updateAdminBadges();
  }

  function openAdminRequestsModal() {
    el.modalAdminRequests.classList.remove('hidden');
    state.activeAdminTab = 'pending';
    el.adminTabPending.classList.add('active');
    el.adminTabHistory.classList.remove('active');
    if (el.adminTabUsers) el.adminTabUsers.classList.remove('active');
    renderAdminRequests('pending');
  }

  function closeAdminRequestsModal() {
    el.modalAdminRequests.classList.add('hidden');
  }

  function renderAdminRequests(tab = 'pending') {
    el.adminRequestsList.innerHTML = '';
    const filtered = state.requests.filter((r) => (tab === 'pending' ? r.status === 'pending' : r.status !== 'pending'));

    if (filtered.length === 0) {
      el.adminRequestsList.innerHTML = `
        <div style="text-align:center; padding: 40px 20px; color: var(--text-muted);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:12px; opacity:0.6;">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 14 14"></polyline>
          </svg>
          <div style="font-size:15px; font-weight:600; color:var(--text-header);">No ${tab} requests</div>
          <div style="font-size:13px; margin-top:4px;">All caught up! New account signups will appear here for bokit's review.</div>
        </div>
      `;
      return;
    }

    filtered.forEach((req) => {
      const card = document.createElement('div');
      card.className = 'request-card';

      // Header
      const header = document.createElement('div');
      header.className = 'request-card-header';

      const userWrap = document.createElement('div');
      userWrap.className = 'request-user-info';

      const avatar = document.createElement('div');
      avatar.className = 'request-avatar';
      setAvatarContent(avatar, req);

      const names = document.createElement('div');
      names.className = 'request-names';
      names.innerHTML = `
        <span class="request-display">${escapeHtml(req.displayName)}</span>
        <span class="request-username">@${escapeHtml(req.username)}</span>
      `;

      userWrap.appendChild(avatar);
      userWrap.appendChild(names);

      const rightMeta = document.createElement('div');
      rightMeta.className = 'request-date';
      if (req.status === 'approved') {
        rightMeta.innerHTML = `<span class="status-badge approved">Approved</span>`;
      } else if (req.status === 'rejected') {
        rightMeta.innerHTML = `<span class="status-badge rejected">Declined</span>`;
      } else {
        rightMeta.textContent = formatTimestamp(req.createdAt);
      }

      header.appendChild(userWrap);
      header.appendChild(rightMeta);
      card.appendChild(header);

      // 200 Char Note Box
      const noteBox = document.createElement('div');
      noteBox.className = 'request-note-box';
      noteBox.innerHTML = `
        <div class="request-note-label">Applicant Note for bokit (200 char limit)</div>
        <div class="request-note-content">${escapeHtml(req.note || 'No note provided by applicant.')}</div>
      `;
      card.appendChild(noteBox);

      // If rejected, show rejection note
      if (req.status === 'rejected' && req.rejectionNote) {
        const rejectBox = document.createElement('div');
        rejectBox.style.cssText = 'background: rgba(237,66,69,0.1); border-left: 3px solid var(--status-red); padding: 8px 12px; border-radius: 4px; font-size: 13px;';
        rejectBox.innerHTML = `<strong>Bokit's Rejection Reason:</strong> "${escapeHtml(req.rejectionNote)}"`;
        card.appendChild(rejectBox);
      }

      // Actions (Only for pending requests)
      if (req.status === 'pending') {
        const actions = document.createElement('div');
        actions.className = 'request-actions';

        const rejectBtn = document.createElement('button');
        rejectBtn.className = 'btn btn-danger';
        rejectBtn.innerHTML = `<span>Decline...</span>`;
        rejectBtn.addEventListener('click', () => openRejectModal(req));

        const approveBtn = document.createElement('button');
        approveBtn.className = 'btn btn-success';
        approveBtn.innerHTML = `<span>Approve Account</span>`;
        approveBtn.addEventListener('click', () => approveAccountRequest(req.id, req.username));

        actions.appendChild(rejectBtn);
        actions.appendChild(approveBtn);
        card.appendChild(actions);
      }

      el.adminRequestsList.appendChild(card);
    });
  }

  async function approveAccountRequest(requestId, username) {
    try {
      const res = await fetch(`/api/admin/requests/${requestId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${state.token}` },
      });
      const data = await res.json();
      if (res.ok) {
        fetchAdminRequests();
        loadUsers();
      } else {
        alert(data.error || 'Failed to approve request.');
      }
    } catch (err) {
      alert('Could not approve request.');
    }
  }

  function openRejectModal(req) {
    state.rejectingRequestId = req.id;
    el.rejectTargetUser.textContent = `@${req.username} (${req.displayName})`;
    el.rejectNoteInput.value = '';
    el.modalRejectReason.classList.remove('hidden');
    el.rejectNoteInput.focus();
  }

  function closeRejectModal() {
    el.modalRejectReason.classList.add('hidden');
    state.rejectingRequestId = null;
  }

  async function submitRejection() {
    const reason = el.rejectNoteInput.value.trim();
    if (!reason) {
      alert('Please write a note explaining why this account cannot be created.');
      return;
    }

    try {
      const res = await fetch(`/api/admin/requests/${state.rejectingRequestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();
      if (res.ok) {
        closeRejectModal();
        fetchAdminRequests();
      } else {
        alert(data.error || 'Failed to reject request.');
      }
    } catch (err) {
      alert('Could not reject request.');
    }
  }

  // ============================================================================
  // BOKIT ACCOUNT MANAGEMENT & DELETION
  // ============================================================================

  async function renderAdminManageAccounts() {
    el.adminRequestsList.innerHTML = `
      <div style="text-align:center; padding: 40px 20px; color: var(--text-muted);">
        <div style="font-size:14px; font-weight:500;">Loading user accounts...</div>
      </div>
    `;

    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${state.token}` },
      });
      if (!res.ok) {
        el.adminRequestsList.innerHTML = `
          <div style="text-align:center; padding: 30px; color: var(--status-red);">
            Failed to load accounts. (HTTP ${res.status})
          </div>
        `;
        return;
      }
      const users = await res.json();
      el.adminRequestsList.innerHTML = '';

      if (users.length === 0) {
        el.adminRequestsList.innerHTML = `
          <div style="text-align:center; padding: 40px 20px; color: var(--text-muted);">
            <div style="font-size:15px; font-weight:600; color:var(--text-header);">No accounts found</div>
          </div>
        `;
        return;
      }

      users.forEach((u) => {
        const card = document.createElement('div');
        card.className = 'request-card manage-account-card';

        const header = document.createElement('div');
        header.className = 'request-card-header';

        const userWrap = document.createElement('div');
        userWrap.className = 'request-user-info';

        const avatar = document.createElement('div');
        avatar.className = 'request-avatar';
        setAvatarContent(avatar, u);

        const isBokitPrimary = u.username.toLowerCase() === 'bokit' || u.id === 'admin-bokit-id';
        const isOwner = isBokitPrimary;
        const isAdmin = u.role === 'admin';

        const names = document.createElement('div');
        names.className = 'request-names';
        names.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span class="request-display">${escapeHtml(u.displayName)}</span>
            ${
              isOwner
                ? '<span class="status-badge owner-badge">OWNER &bull; ADMIN</span>'
                : (isAdmin
                    ? '<span class="status-badge admin-badge">ADMIN</span>'
                    : '<span class="status-badge member-badge">MEMBER</span>')
            }
            ${
              u.hasMembership
                ? '<span class="status-badge" style="background:linear-gradient(135deg,#f59e0b,#d97706); color:#fff; font-weight:700;">💎 NO-ADS MEMBER</span>'
                : ''
            }
          </div>
          <span class="request-username">@${escapeHtml(u.username)}</span>
        `;

        userWrap.appendChild(avatar);
        userWrap.appendChild(names);

        const rightMeta = document.createElement('div');
        rightMeta.className = 'request-date';
        const joinedDate = u.createdAt ? formatTimestamp(u.createdAt) : 'Unknown';
        rightMeta.innerHTML = `<span style="font-size:12px; color:var(--text-muted);">Joined ${joinedDate}</span>`;

        header.appendChild(userWrap);
        header.appendChild(rightMeta);
        card.appendChild(header);

        // User Bio / About Me with inline admin editor
        const bioBox = document.createElement('div');
        bioBox.className = 'request-note-box';
        const initialBio = u.bio || '';
        const bioDisplay = initialBio ? escapeHtml(initialBio) : '<em style="color:var(--text-muted);">No bio set</em>';
        bioBox.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <div class="request-note-label">User Bio / About Me</div>
            <button class="btn btn-secondary btn-xs btn-admin-edit-bio" style="font-size:11px; padding:2px 8px;" type="button">✏️ Edit Bio</button>
          </div>
          <div class="request-note-content bio-display-text">${bioDisplay}</div>
          <div class="bio-inline-form hidden" style="margin-top:8px;">
            <textarea class="input-inline-bio" maxlength="200" rows="2" style="width:100%; box-sizing:border-box; background:var(--bg-tertiary); border:1px solid var(--border-subtle); border-radius:4px; padding:6px; color:var(--text-normal); font-size:13px; font-family:inherit; resize:vertical;" placeholder="Enter new bio (max 200 chars)...">${escapeHtml(initialBio)}</textarea>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
              <span class="inline-bio-status" style="font-size:11.5px;"></span>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-secondary btn-xs btn-inline-cancel" type="button">Cancel</button>
                <button class="btn btn-blurple btn-xs btn-inline-save" type="button">Save Bio</button>
              </div>
            </div>
          </div>
        `;
        card.appendChild(bioBox);

        const btnEdit = bioBox.querySelector('.btn-admin-edit-bio');
        const textDisplay = bioBox.querySelector('.bio-display-text');
        const formWrap = bioBox.querySelector('.bio-inline-form');
        const textarea = bioBox.querySelector('.input-inline-bio');
        const btnCancel = bioBox.querySelector('.btn-inline-cancel');
        const btnSave = bioBox.querySelector('.btn-inline-save');
        const statusEl = bioBox.querySelector('.inline-bio-status');

        btnEdit.addEventListener('click', () => {
          formWrap.classList.remove('hidden');
          textDisplay.classList.add('hidden');
          btnEdit.classList.add('hidden');
          textarea.value = u.bio || '';
          textarea.focus();
        });

        btnCancel.addEventListener('click', () => {
          formWrap.classList.add('hidden');
          textDisplay.classList.remove('hidden');
          btnEdit.classList.remove('hidden');
          statusEl.textContent = '';
        });

        btnSave.addEventListener('click', async () => {
          const newBio = textarea.value.trim();
          if (newBio.length > 200) {
            statusEl.style.color = 'var(--status-red)';
            statusEl.textContent = '❌ Max 200 characters.';
            return;
          }
          btnSave.disabled = true;
          statusEl.style.color = 'var(--text-muted)';
          statusEl.textContent = 'Saving...';
          try {
            const res = await fetch(`/api/admin/users/${encodeURIComponent(u.id)}/bio`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${state.token}`,
              },
              body: JSON.stringify({ bio: newBio }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
              u.bio = newBio;
              const foundInState = (state.users || []).find((x) => x.id === u.id);
              if (foundInState) foundInState.bio = newBio;
              textDisplay.innerHTML = newBio ? escapeHtml(newBio) : '<em style="color:var(--text-muted);">No bio set</em>';
              formWrap.classList.add('hidden');
              textDisplay.classList.remove('hidden');
              btnEdit.classList.remove('hidden');
              statusEl.textContent = '';
            } else {
              statusEl.style.color = 'var(--status-red)';
              statusEl.textContent = `❌ ${data.error || 'Failed'}`;
            }
          } catch (err) {
            statusEl.style.color = 'var(--status-red)';
            statusEl.textContent = '❌ Network error';
          } finally {
            btnSave.disabled = false;
          }
        });

        const actions = document.createElement('div');
        actions.className = 'request-actions';

        if (isOwner) {
          const protectedLabel = document.createElement('div');
          protectedLabel.className = 'protected-account-note';
          protectedLabel.innerHTML = `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:text-bottom; margin-right:5px;">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
            <span>Primary Server Administrator &bull; Protected</span>
          `;
          actions.appendChild(protectedLabel);
        } else {
          // Bokit-Only: Grant or Revoke No-Ads Membership ($5/Monthly)
          if (isUserBokit()) {
            const memberBtn = document.createElement('button');
            if (u.hasMembership) {
              memberBtn.className = 'btn btn-secondary';
              memberBtn.innerHTML = `<span>💎 Revoke Membership</span>`;
              memberBtn.title = `Revoke No-Ads Membership from @${u.username}`;
            } else {
              memberBtn.className = 'btn';
              memberBtn.style.cssText = 'background:linear-gradient(135deg,#f59e0b,#d97706); color:#fff; border:none; font-weight:600;';
              memberBtn.innerHTML = `<span>💎 Give Membership</span>`;
              memberBtn.title = `Grant No-Ads Membership ($5/Monthly) to @${u.username}`;
            }
            memberBtn.addEventListener('click', () => toggleUserMembership(u));
            actions.appendChild(memberBtn);
          }

          // Grant or Revoke Admin role button
          const roleBtn = document.createElement('button');
          if (u.role === 'admin') {
            roleBtn.className = 'btn btn-secondary';
            roleBtn.innerHTML = `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px; vertical-align:text-bottom;">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>Revoke Admin</span>
            `;
            roleBtn.title = `Remove administrator permissions from @${u.username}`;
          } else {
            roleBtn.className = 'btn btn-blurple';
            roleBtn.innerHTML = `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px; vertical-align:text-bottom;">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>Make Admin</span>
            `;
            roleBtn.title = `Grant administrator permissions to @${u.username}`;
          }
          roleBtn.addEventListener('click', () => toggleUserAdminRole(u));
          actions.appendChild(roleBtn);

          const delBtn = document.createElement('button');
          delBtn.className = 'btn btn-danger';
          delBtn.innerHTML = `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px; vertical-align:text-bottom;">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            <span>Delete Account</span>
          `;
          delBtn.addEventListener('click', () => deleteUserAccount(u));
          actions.appendChild(delBtn);
        }

        card.appendChild(actions);
        el.adminRequestsList.appendChild(card);
      });
    } catch (err) {
      console.error('Fetch admin users error:', err);
      el.adminRequestsList.innerHTML = `
        <div style="text-align:center; padding: 30px; color: var(--status-red);">
          Error connecting to server to load accounts.
        </div>
      `;
    }
  }

  async function toggleUserMembership(user) {
    if (!isUserBokit()) {
      alert('Only the primary @bokit account can give or revoke the No-Ads Membership.');
      return;
    }
    const isCurrentlyMember = Boolean(user.hasMembership);
    const newMembership = !isCurrentlyMember;
    const actionDesc = isCurrentlyMember
      ? `Revoke the No-Ads Membership ($5/Monthly) from @${user.username} (${user.displayName})?`
      : `Give the No-Ads Membership ($5/Monthly — No Ads) to @${user.username} (${user.displayName})?`;

    if (!confirm(actionDesc)) return;

    try {
      if (el.btnProfileToggleMembership) el.btnProfileToggleMembership.disabled = true;
      const res = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}/membership`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify({ hasMembership: newMembership }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        user.hasMembership = newMembership;
        const u = (state.users || []).find((x) => x.id === user.id);
        if (u) u.hasMembership = newMembership;
        if (state.activeProfileUser && state.activeProfileUser.id === user.id) {
          state.activeProfileUser.hasMembership = newMembership;
          if (el.profileBadgeMembership) {
            el.profileBadgeMembership.classList.toggle('hidden', !newMembership);
          }
          if (el.profileBtnMembershipText) {
            el.profileBtnMembershipText.textContent = newMembership
              ? 'Revoke Membership (No Ads)'
              : 'Give Membership (No Ads)';
          }
        }
        renderMembers();
        if (state.activeAdminTab === 'users' && el.modalAdminRequests && !el.modalAdminRequests.classList.contains('hidden')) {
          renderAdminManageAccounts();
        }
      } else {
        alert(data.error || 'Failed to update user membership.');
      }
    } catch (err) {
      console.error('Toggle user membership error:', err);
      alert('Network error while updating user membership.');
    } finally {
      if (el.btnProfileToggleMembership) el.btnProfileToggleMembership.disabled = false;
    }
  }

  async function toggleUserAdminRole(user) {
    if (!isUserBokit()) {
      alert('Only administrator bokit can grant or revoke admin privileges.');
      return;
    }
    const isCurrentlyAdmin = user.role === 'admin';
    const newRole = isCurrentlyAdmin ? 'user' : 'admin';
    const actionDesc = isCurrentlyAdmin
      ? `Revoke administrator privileges from @${user.username} (${user.displayName})?`
      : `Promote @${user.username} (${user.displayName}) to Server Administrator?`;

    if (!confirm(actionDesc)) return;

    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        user.role = newRole;
        const u = (state.users || []).find((x) => x.id === user.id);
        if (u) u.role = newRole;

        renderMembers();
        renderAdminManageAccounts();
      } else {
        alert(data.error || 'Failed to update user role.');
      }
    } catch (err) {
      console.error('Toggle admin role error:', err);
      alert('Network error while updating user role.');
    }
  }

  async function deleteUserAccount(user) {
    const confirmMsg = `Are you sure you want to permanently delete the account @${user.username} (${user.displayName})?\n\n` +
      `• Their login will be immediately terminated.\n` +
      `• Their account record, friend connections, and request records will be permanently removed.\n\n` +
      `This action cannot be undone.`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${state.token}` },
      });
      const data = await res.json();
      if (res.ok) {
        // Refresh the accounts list in the modal
        renderAdminManageAccounts();
        // Refresh active members sidebar
        loadUsers();
        // Refresh requests count/list
        fetchAdminRequests();
      } else {
        alert(data.error || 'Failed to delete user account.');
      }
    } catch (err) {
      console.error('Delete account error:', err);
      alert('Network error while deleting account.');
    }
  }

  // ============================================================================
  // TELEGRAM KEY VERIFICATION & E2EE MODAL
  // ============================================================================

  async function openEncryptionInfoModal() {
    if (window.BokitCrypto) {
      try {
        const fp = await window.BokitCrypto.getKeyFingerprint(state.currentChannelId);
        if (el.cryptoEmojisRow) {
          el.cryptoEmojisRow.innerHTML = fp.emojis.map((em) => `<span>${em}</span>`).join('');
        }
        if (el.cryptoHexFingerprint) {
          el.cryptoHexFingerprint.textContent = fp.hex;
        }
      } catch (err) {
        console.error('Error fetching key fingerprint:', err);
      }
    }
    if (el.modalEncryptionInfo) {
      el.modalEncryptionInfo.classList.remove('hidden');
    }
  }

  function closeEncryptionInfoModal() {
    if (el.modalEncryptionInfo) {
      el.modalEncryptionInfo.classList.add('hidden');
    }
  }

  // ============================================================================
  // DIRECT MESSAGING SYSTEM (DMs)
  // ============================================================================

  async function loadActiveDms() {
    if (!state.token || !state.user) return;
    try {
      const storageKey = `bokitcord_open_dms_${state.user.id}`;
      let localList = [];
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) localList = JSON.parse(stored);
      } catch (e) {
        localList = [];
      }

      const res = await fetch('/api/dms', {
        headers: { Authorization: `Bearer ${state.token}` },
      });
      let serverList = [];
      if (res.ok) {
        serverList = await res.json();
      }

      const mergedMap = new Map();
      serverList.forEach((dm) => mergedMap.set(dm.id, dm));
      localList.forEach((dm) => {
        if (!mergedMap.has(dm.id)) {
          const found =
            (state.users && state.users.find((u) => u.id === dm.id)) ||
            (state.friends && state.friends.find((f) => f.friend && f.friend.id === dm.id)?.friend);
          if (found) {
            mergedMap.set(dm.id, { ...dm, ...found });
          } else {
            mergedMap.set(dm.id, dm);
          }
        }
      });

      state.openDms = Array.from(mergedMap.values());
      saveOpenDms();
      renderDmList();
    } catch (err) {
      console.error('Active DMs load error:', err);
    }
  }

  function saveOpenDms() {
    if (!state.user) return;
    const storageKey = `bokitcord_open_dms_${state.user.id}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state.openDms));
    } catch (e) {
      console.warn('Could not save open DMs to localStorage:', e);
    }
  }

  function addOpenDm(contact) {
    if (!contact || !contact.id || (state.user && contact.id === state.user.id)) return;
    const existingIndex = state.openDms.findIndex((dm) => dm.id === contact.id);
    if (existingIndex !== -1) {
      const existing = state.openDms.splice(existingIndex, 1)[0];
      state.openDms.unshift({ ...existing, ...contact });
    } else {
      state.openDms.unshift(contact);
    }
    saveOpenDms();
    renderDmList();
  }

  function removeOpenDm(userId) {
    state.openDms = state.openDms.filter((dm) => dm.id !== userId);
    state.unreadDms.delete(userId);
    if (state.unreadDmCounts) {
      delete state.unreadDmCounts[userId];
    }
    saveOpenDms();
    updateAllDmBadges();

    if (state.currentView === 'dm' && state.currentDmRecipient?.id === userId) {
      switchToFriendsView();
    }
  }

  function updateAllDmBadges() {
    let totalUnread = 0;
    if (state.unreadDmCounts) {
      for (const count of Object.values(state.unreadDmCounts)) {
        totalUnread += (Number(count) || 0);
      }
    }

    // Home button badge on left rail
    if (el.homeBadgeCount) {
      if (totalUnread > 0) {
        el.homeBadgeCount.textContent = totalUnread > 99 ? '99+' : totalUnread;
        el.homeBadgeCount.classList.remove('hidden');
      } else {
        el.homeBadgeCount.classList.add('hidden');
      }
    }

    // Top navbar Chat tab badge (indicates unread DMs when on Browser or PS1 tabs)
    if (el.chatTabBadge) {
      if (totalUnread > 0) {
        el.chatTabBadge.textContent = totalUnread > 99 ? '99+' : totalUnread;
        el.chatTabBadge.classList.remove('hidden');
      } else {
        el.chatTabBadge.classList.add('hidden');
      }
    }

    // Dynamic browser tab title
    const baseTitle = 'BokitCord — Discord Platform';
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }

    // Update DM sidebar list items
    renderDmList();
  }

  function playDmNotificationSound() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      // Pleasant 2-tone chime: E5 (659Hz) transitioning to A5 (880Hz)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.setValueAtTime(880.00, now + 0.08);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.32);
    } catch (e) {
      // AudioContext could be restricted before first user gesture
    }
  }

  function initNotificationSystem() {
    updateNotificationToggleState();

    if (el.btnNotificationToggle) {
      el.btnNotificationToggle.addEventListener('click', () => {
        handleNotificationToggleClick();
      });
    }

    if (el.btnEnableNotifications) {
      el.btnEnableNotifications.addEventListener('click', async () => {
        await requestDesktopNotificationPermission();
      });
    }

    if (el.btnDismissNotifications) {
      el.btnDismissNotifications.addEventListener('click', () => {
        if (el.dmNotificationBanner) el.dmNotificationBanner.classList.add('hidden');
        localStorage.setItem('bokit_notifications_dismissed', 'true');
      });
    }

    // Focus listener to clear unread for active DM
    window.addEventListener('focus', () => {
      if (state.currentView === 'dm' && state.currentDmRecipient) {
        if (state.unreadDmCounts) delete state.unreadDmCounts[state.currentDmRecipient.id];
        state.unreadDms.delete(state.currentDmRecipient.id);
        updateAllDmBadges();
      }
    });

    checkNotificationBannerPrompt();
  }

  function checkNotificationBannerPrompt() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted' || Notification.permission === 'denied') {
      if (el.dmNotificationBanner) el.dmNotificationBanner.classList.add('hidden');
      return;
    }
    const dismissed = localStorage.getItem('bokit_notifications_dismissed') === 'true';
    if (!dismissed && el.dmNotificationBanner) {
      el.dmNotificationBanner.classList.remove('hidden');
    }
  }

  function updateNotificationToggleState() {
    if (!el.btnNotificationToggle) return;
    if (!('Notification' in window)) {
      el.btnNotificationToggle.style.display = 'none';
      return;
    }
    if (Notification.permission === 'granted') {
      el.btnNotificationToggle.classList.add('active');
      el.btnNotificationToggle.title = 'Desktop Notifications: Enabled (Click to test alert)';
    } else if (Notification.permission === 'denied') {
      el.btnNotificationToggle.classList.remove('active');
      el.btnNotificationToggle.title = 'Desktop Notifications: Blocked in browser settings';
    } else {
      el.btnNotificationToggle.classList.remove('active');
      el.btnNotificationToggle.title = 'Desktop Notifications: Click to enable alerts';
    }
  }

  async function requestDesktopNotificationPermission() {
    if (!('Notification' in window)) {
      alert('Desktop notifications are not supported by your browser.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      updateNotificationToggleState();
      if (el.dmNotificationBanner) el.dmNotificationBanner.classList.add('hidden');

      if (permission === 'granted') {
        new Notification('Notifications Enabled! 🔔', {
          body: 'You will receive alerts when friends send you direct messages on BokitCord.',
          icon: '/favicon.ico',
        });
        return true;
      }
    } catch (e) {
      console.error('Notification permission error:', e);
    }
    return false;
  }

  async function handleNotificationToggleClick() {
    if (!('Notification' in window)) {
      alert('Desktop notifications are not supported in your browser.');
      return;
    }

    if (Notification.permission === 'default') {
      await requestDesktopNotificationPermission();
    } else if (Notification.permission === 'granted') {
      new Notification('BokitCord Notifications Active 🔔', {
        body: 'Desktop notifications are working! You will receive alerts when friends DM you.',
        icon: '/favicon.ico',
      });
    } else if (Notification.permission === 'denied') {
      alert('Desktop notifications are blocked by your browser. Please click the permissions icon in your browser address bar and set Notifications to "Allow".');
    }
  }

  function renderDmList() {
    if (!el.dmList) return;
    el.dmList.innerHTML = '';

    if (!state.openDms || state.openDms.length === 0) {
      const emptyLi = document.createElement('li');
      emptyLi.style.cssText = 'padding: 10px 8px; color: var(--text-muted); font-size: 11.5px; text-align: center; line-height: 1.4;';
      emptyLi.textContent = 'No direct messages yet. Click "Message" on any friend to start chatting!';
      el.dmList.appendChild(emptyLi);
      return;
    }

    state.openDms.forEach((contact) => {
      const li = document.createElement('li');
      li.className = 'dm-item-wrapper';

      const isCurrent = state.currentView === 'dm' && state.currentDmRecipient?.id === contact.id;
      const count = (state.unreadDmCounts && state.unreadDmCounts[contact.id]) || (state.unreadDms.has(contact.id) ? 1 : 0);
      const isUnread = count > 0;

      const btn = document.createElement('button');
      btn.className = `channel-item dm-item ${isCurrent ? 'active' : ''}`;
      btn.setAttribute('type', 'button');

      const avatarWrap = document.createElement('div');
      avatarWrap.className = 'dm-avatar-wrap';

      const avatar = document.createElement('div');
      avatar.className = 'dm-avatar';
      setAvatarContent(avatar, contact);

      const statusDot = document.createElement('div');
      statusDot.className = `status-indicator ${contact.status || 'offline'}`;

      avatarWrap.appendChild(avatar);
      avatarWrap.appendChild(statusDot);

      const info = document.createElement('div');
      info.className = 'dm-info';

      const name = document.createElement('span');
      name.className = 'dm-name';
      name.textContent = contact.displayName || contact.username;

      const sub = document.createElement('span');
      sub.className = 'dm-sub';
      sub.textContent = `@${contact.username}`;

      info.appendChild(name);
      info.appendChild(sub);

      btn.appendChild(avatarWrap);
      btn.appendChild(info);

      if (isUnread && !isCurrent) {
        // Red circular count badge on avatar bottom-right (matches user reference design!)
        const avatarBadge = document.createElement('div');
        avatarBadge.className = 'dm-avatar-badge';
        avatarBadge.textContent = count > 99 ? '99+' : count;
        avatarBadge.title = `${count} unread message${count === 1 ? '' : 's'}`;
        avatarWrap.appendChild(avatarBadge);

        // Count pill badge on the right of the contact row
        const unreadPill = document.createElement('span');
        unreadPill.className = 'dm-item-badge';
        unreadPill.textContent = count > 99 ? '99+' : count;
        unreadPill.title = `${count} unread message${count === 1 ? '' : 's'}`;
        btn.appendChild(unreadPill);
      }

      const closeBtn = document.createElement('button');
      closeBtn.className = 'dm-close-btn';
      closeBtn.setAttribute('type', 'button');
      closeBtn.title = 'Close DM';
      closeBtn.innerHTML = '&times;';
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeOpenDm(contact.id);
      });

      btn.appendChild(closeBtn);

      btn.addEventListener('click', () => {
        if (state.unreadDmCounts) delete state.unreadDmCounts[contact.id];
        state.unreadDms.delete(contact.id);
        updateAllDmBadges();
        openDirectMessage(contact);
      });

      li.appendChild(btn);
      el.dmList.appendChild(li);
    });
  }

  function openDirectMessage(targetUser) {
    if (!state.user || !targetUser || targetUser.id === state.user.id) return;

    const dmChannelId = `dm_${[state.user.id, targetUser.id].sort().join('_')}`;

    if (state.socket && state.currentChannelId !== dmChannelId) {
      state.socket.emit('leave_channel', { channelId: state.currentChannelId });
    }

    state.currentView = 'dm';
    state.currentChannelId = dmChannelId;
    state.currentDmRecipient = targetUser;
    if (state.unreadDmCounts) {
      delete state.unreadDmCounts[targetUser.id];
    }
    state.unreadDms.delete(targetUser.id);
    updateAllDmBadges();

    // Add to open DMs list if not already present
    addOpenDm(targetUser);

    // Update rail & sidebar active state: Home/DM is active, Community is inactive
    el.navBtnHome.classList.add('active');
    el.navBtnCommunity.classList.remove('active');
    el.channelsSection.classList.add('hidden');
    el.dmSection.classList.remove('hidden');
    el.btnSidebarFriends.classList.remove('active');

    // Switch main container: hide friends container, show chat container
    el.friendsContainer.classList.add('hidden');
    el.chatContainer.classList.remove('hidden');

    // Remove active class from channel list
    document.querySelectorAll('.channel-item').forEach((c) => c.classList.remove('active'));

    // Update chat header for DM
    if (el.chatHeaderIcon) el.chatHeaderIcon.textContent = '@';
    el.chatHeaderName.textContent = targetUser.displayName || targetUser.username;
    el.chatHeaderTopic.textContent = `@${targetUser.username} • Direct Message (AES-256-GCM E2EE)`;
    el.chatInputText.placeholder = `Message @${targetUser.displayName || targetUser.username} (or click 'Embed' to send rich embed)`;

    // Join socket room
    if (state.socket) {
      state.socket.emit('join_channel', { channelId: dmChannelId });
    }

    // Render DMs in sidebar to reflect active selection
    renderDmList();
    updateChatInputPermissions();
    updateTypingIndicatorDisplay();

    // Load messages for this DM
    loadDmMessages(targetUser.id, dmChannelId, targetUser);
  }

  async function loadDmMessages(targetUserId, dmChannelId, targetUser) {
    el.messageStream.innerHTML = '';
    try {
      const res = await fetch(`/api/dms/${targetUserId}`, {
        headers: { Authorization: `Bearer ${state.token}` },
      });
      const messages = await res.json();

      if (!messages || messages.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-channel-state';
        emptyState.innerHTML = `
          <div class="empty-channel-icon" style="${targetUser.avatarUrl ? `background-image: url('${targetUser.avatarUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat; background-color: transparent;` : `background-color: ${targetUser.avatarColor || '#5865F2'}; color:#ffffff; font-size:30px; display:flex; align-items:center; justify-content:center; font-weight:700;`} border-radius:50%; width:68px; height:68px; margin:0 auto 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.35);">
            ${targetUser.avatarUrl ? '' : escapeHtml((targetUser.displayName || targetUser.username).charAt(0).toUpperCase())}
          </div>
          <h2 class="empty-channel-title" style="font-size:24px; font-weight:700;">${escapeHtml(targetUser.displayName || targetUser.username)}</h2>
          <p class="empty-channel-sub">This is the start of your direct message history with <strong>@${escapeHtml(targetUser.username)}</strong>.</p>
          <div class="empty-channel-meta">
            <span class="meta-pill">AES-256-GCM E2EE Active</span>
            <span class="meta-pill">Direct Message</span>
          </div>
        `;
        el.messageStream.appendChild(emptyState);
      } else {
        for (const rawMsg of messages) {
          const preparedMsg = await decryptIfNeeded(rawMsg);
          appendMessage(preparedMsg);
        }
        refreshVisibleMessageAvatars();
      }
      scrollToBottom();
    } catch (err) {
      console.error('Load DM messages error:', err);
    }
  }

  // ============================================================================
  // FRIENDS SYSTEM (STRICT ENFORCEMENT: USERNAME ONLY, NOT DISPLAY NAME)
  // ============================================================================

  function switchToFriendsView() {
    state.currentView = 'friends';
    state.currentDmRecipient = null;
    el.chatContainer.classList.add('hidden');
    el.friendsContainer.classList.remove('hidden');

    // Server rail active state: Home is active, Community is inactive
    el.navBtnHome.classList.add('active');
    el.navBtnCommunity.classList.remove('active');

    // Sidebar sections: DM/Friends active, Channels inactive
    el.channelsSection.classList.add('hidden');
    el.dmSection.classList.remove('hidden');

    // Remove active class from channel list and DM list
    document.querySelectorAll('.channel-item').forEach((c) => c.classList.remove('active'));
    el.btnSidebarFriends.classList.add('active');

    if (el.chatHeaderIcon) el.chatHeaderIcon.textContent = '@';
    el.chatHeaderName.textContent = 'Friends';
    el.chatHeaderTopic.textContent = 'Add friends by unique username only';

    switchFriendsTab(state.friendsTab);
    renderDmList();
  }

  function switchToCommunityView() {
    state.currentView = 'channels';
    state.currentDmRecipient = null;
    el.friendsContainer.classList.add('hidden');
    el.chatContainer.classList.remove('hidden');

    // Server rail active state: Community is active, Home is inactive
    el.navBtnCommunity.classList.add('active');
    el.navBtnHome.classList.remove('active');

    // Sidebar sections: Channels active, DM/Friends inactive
    el.channelsSection.classList.remove('hidden');
    el.dmSection.classList.add('hidden');
    el.btnSidebarFriends.classList.remove('active');

    // Remove active class from DM list
    document.querySelectorAll('.dm-item').forEach((c) => c.classList.remove('active'));

    // Restore current channel header info
    const ch = state.channels.find((c) => c.id === state.currentChannelId) || state.channels[0];
    if (ch) {
      if (el.chatHeaderIcon) el.chatHeaderIcon.textContent = '#';
      el.chatHeaderName.textContent = ch.name;
      el.chatHeaderTopic.textContent = ch.topic || `Welcome to #${ch.name}!`;
    }

    renderChannels();
    updateChatInputPermissions();
    updateTypingIndicatorDisplay();
  }

  function switchFriendsTab(tab) {
    state.friendsTab = tab;

    el.subnavBtnOnline.classList.toggle('active', tab === 'online');
    el.subnavBtnAll.classList.toggle('active', tab === 'all');
    el.subnavBtnPending.classList.toggle('active', tab === 'pending');
    el.subnavBtnAdd.classList.toggle('active', tab === 'add');

    if (tab === 'add') {
      el.tabContentAdd.classList.remove('hidden');
      el.tabContentList.classList.add('hidden');
      el.addFriendFeedback.classList.add('hidden');
      el.inputFriendUsername.focus();
    } else {
      el.tabContentAdd.classList.add('hidden');
      el.tabContentList.classList.remove('hidden');
      renderFriendsList(tab);
    }
  }

  function setAddFriendFeedback(type, message) {
    el.addFriendFeedback.className = `add-friend-feedback ${type}`;
    el.addFriendFeedback.textContent = message;
    el.addFriendFeedback.classList.remove('hidden');
  }

  async function loadFriends() {
    if (!state.token) return;
    try {
      const res = await fetch('/api/friends', {
        headers: { Authorization: `Bearer ${state.token}` },
      });
      if (res.ok) {
        state.friends = await res.json();
        updateFriendsBadges();
        if (state.currentView === 'friends' && state.friendsTab !== 'add') {
          renderFriendsList(state.friendsTab);
        }
      }
    } catch (err) {
      console.error('Friends load error:', err);
    }
  }

  function updateFriendsBadges() {
    const incomingPending = state.friends.filter((f) => f.isIncoming).length;
    if (incomingPending > 0) {
      el.pendingFriendsBadge.textContent = incomingPending;
      el.pendingFriendsBadge.classList.remove('hidden');
    } else {
      el.pendingFriendsBadge.classList.add('hidden');
    }
  }

  function renderFriendsList(tab) {
    el.friendsListContainer.innerHTML = '';

    let filtered = [];
    if (tab === 'online') {
      filtered = state.friends.filter((f) => f.status === 'accepted' && f.friend.status === 'online');
      el.friendListTitle.textContent = `ONLINE FRIENDS — ${filtered.length}`;
    } else if (tab === 'all') {
      filtered = state.friends.filter((f) => f.status === 'accepted');
      el.friendListTitle.textContent = `ALL FRIENDS — ${filtered.length}`;
    } else if (tab === 'pending') {
      filtered = state.friends.filter((f) => f.status === 'pending');
      el.friendListTitle.textContent = `PENDING REQUESTS — ${filtered.length}`;
    }

    if (filtered.length === 0) {
      el.friendsListContainer.innerHTML = `
        <div style="text-align:center; padding: 40px; color: var(--text-muted);">
          <div style="font-size: 15px; font-weight:600; color:var(--text-header);">No friends found here</div>
          <div style="font-size: 13px; margin-top: 4px;">Click <strong>Add Friend</strong> to send requests by unique @username!</div>
        </div>
      `;
      return;
    }

    filtered.forEach((item) => {
      const u = item.friend;
      const card = document.createElement('div');
      card.className = 'friend-row-card';

      const left = document.createElement('div');
      left.className = 'friend-card-left';

      const avatar = document.createElement('div');
      avatar.className = 'friend-row-avatar';
      setAvatarContent(avatar, u);
      avatar.style.cursor = 'pointer';
      avatar.addEventListener('click', () => openUserProfile(u.id, u.username, u.displayName, u.avatarColor, u.role, u.bio, u.avatarUrl));

      const names = document.createElement('div');
      names.innerHTML = `
        <div style="font-size:14.5px; font-weight:600; color:var(--text-header);">${escapeHtml(u.displayName)}</div>
        <div style="font-size:12px; color:var(--text-muted);">@${escapeHtml(u.username)}</div>
      `;

      left.appendChild(avatar);
      left.appendChild(names);
      card.appendChild(left);

      const actions = document.createElement('div');
      actions.className = 'friend-card-actions';

      if (item.status === 'pending') {
        if (item.isIncoming) {
          const acceptBtn = document.createElement('button');
          acceptBtn.className = 'btn btn-success';
          acceptBtn.textContent = 'Accept';
          acceptBtn.addEventListener('click', () => respondFriend(item.id, 'accept'));

          const rejectBtn = document.createElement('button');
          rejectBtn.className = 'btn btn-secondary';
          rejectBtn.textContent = 'Ignore';
          rejectBtn.addEventListener('click', () => respondFriend(item.id, 'reject'));

          actions.appendChild(acceptBtn);
          actions.appendChild(rejectBtn);
        } else {
          actions.innerHTML = `<span style="font-size:12px; color:var(--text-muted); margin-right:8px;">Outgoing Request</span>`;
          const cancelBtn = document.createElement('button');
          cancelBtn.className = 'btn btn-secondary';
          cancelBtn.textContent = 'Cancel';
          cancelBtn.addEventListener('click', () => respondFriend(item.id, 'reject'));
          actions.appendChild(cancelBtn);
        }
      } else {
        const chatBtn = document.createElement('button');
        chatBtn.className = 'icon-btn dm-chat-action-btn';
        chatBtn.title = 'Message';
        chatBtn.setAttribute('aria-label', `Start chat with @${u.username}`);
        chatBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        `;
        chatBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openDirectMessage(u);
        });

        const profileBtn = document.createElement('button');
        profileBtn.className = 'icon-btn';
        profileBtn.title = 'View Profile';
        profileBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        `;
        profileBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openUserProfile(u.id, u.username, u.displayName, u.avatarColor, u.role, u.bio, u.avatarUrl);
        });

        actions.appendChild(chatBtn);
        actions.appendChild(profileBtn);

        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
          openDirectMessage(u);
        });
      }

      card.appendChild(actions);
      el.friendsListContainer.appendChild(card);
    });
  }

  async function respondFriend(friendshipId, action) {
    try {
      const res = await fetch('/api/friends/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify({ friendshipId, action }),
      });
      if (res.ok) {
        loadFriends();
      }
    } catch (err) {
      console.error('Friend respond error:', err);
    }
  }

  // ============================================================================
  // MEMBERS LIST & USER PROFILE MODAL
  // ============================================================================

  async function loadUsers() {
    try {
      const res = await fetch('/api/users');
      state.users = await res.json();
      renderMembers();
      refreshVisibleMessageAvatars();
    } catch (err) {
      console.error('Users load error:', err);
    }
  }

  function renderMembers() {
    el.adminMemberList.innerHTML = '';
    el.regularMemberList.innerHTML = '';

    const admins = state.users.filter((u) => u.username.toLowerCase() === 'bokit' || u.role === 'admin');
    const regulars = state.users.filter((u) => u.username.toLowerCase() !== 'bokit' && u.role !== 'admin');

    el.countAdmins.textContent = admins.length;
    el.countMembers.textContent = regulars.length;

    admins.forEach((u) => el.adminMemberList.appendChild(createMemberItem(u)));
    regulars.forEach((u) => el.regularMemberList.appendChild(createMemberItem(u)));
  }

  function createMemberItem(u) {
    const item = document.createElement('div');
    item.className = 'member-card-item';
    item.title = `Click to view profile of @${u.username}`;

    const avatarWrap = document.createElement('div');
    avatarWrap.className = 'member-avatar-wrap';

    const avatar = document.createElement('div');
    avatar.className = 'member-avatar';
    setAvatarContent(avatar, u);

    const indicator = document.createElement('div');
    indicator.className = `status-indicator ${u.status || 'offline'}`;

    avatarWrap.appendChild(avatar);
    avatarWrap.appendChild(indicator);

    const details = document.createElement('div');
    details.className = 'member-details';

    const nameRow = document.createElement('div');
    nameRow.className = 'member-name-row';

    const disp = document.createElement('span');
    disp.className = 'member-display';
    disp.textContent = u.displayName;

    nameRow.appendChild(disp);

    if (u.username.toLowerCase() === 'bokit') {
      const crown = document.createElement('span');
      crown.style.cssText = 'color: #fee75c; font-size: 13px;';
      crown.textContent = '👑';
      nameRow.appendChild(crown);
    } else if (u.role === 'admin') {
      const shield = document.createElement('span');
      shield.style.cssText = 'color: #5865F2; font-size: 12px; margin-left: 2px;';
      shield.title = 'Server Administrator';
      shield.textContent = '🛡️';
      nameRow.appendChild(shield);
    }

    if (u.hasMembership) {
      const gem = document.createElement('span');
      gem.style.cssText = 'color: #f59e0b; font-size: 12px; margin-left: 2px;';
      gem.title = 'No-Ads Member ($5/Monthly)';
      gem.textContent = '💎';
      nameRow.appendChild(gem);
    }

    const tag = document.createElement('div');
    tag.className = 'member-tag';
    tag.textContent = `@${u.username}`;

    details.appendChild(nameRow);
    details.appendChild(tag);

    item.appendChild(avatarWrap);
    item.appendChild(details);

    item.addEventListener('click', () => openUserProfile(u.id, u.username, u.displayName, u.avatarColor, u.role, u.bio, u.avatarUrl, u.hasMembership));

    return item;
  }

  function openUserProfile(id, username, displayName, avatarColor, role, bio, avatarUrl, hasMembership) {
    const isSelf = state.user && (state.user.id === id || (username && state.user.username.toLowerCase() === username.toLowerCase()));
    const isBokit = isUserBokit();
    const isBokitPrimary = username && username.toLowerCase() === 'bokit';

    if (avatarUrl === undefined) {
      if (isSelf) {
        avatarUrl = state.user?.avatarUrl;
      } else {
        const found = (state.users || []).find((u) => u.id === id) || (state.friends || []).map((f) => f.friend).find((u) => u && u.id === id);
        avatarUrl = found?.avatarUrl;
      }
    }

    if (bio === undefined || bio === null) {
      if (isSelf) {
        bio = state.user?.bio;
      } else {
        const found = (state.users || []).find((u) => u.id === id) || (state.friends || []).map((f) => f.friend).find((u) => u && u.id === id);
        bio = found?.bio;
      }
    }

    if (role === undefined || role === null) {
      if (isSelf && state.user?.role) {
        role = state.user.role;
      } else {
        const found = (state.users || []).find((u) => u.id === id);
        role = found?.role || (username && username.toLowerCase() === 'bokit' ? 'admin' : 'user');
      }
    }

    if (hasMembership === undefined || hasMembership === null) {
      if (isSelf) {
        hasMembership = Boolean(state.user?.hasMembership);
      } else {
        const found = (state.users || []).find((u) => u.id === id) || (state.friends || []).map((f) => f.friend).find((u) => u && u.id === id);
        hasMembership = Boolean(found?.hasMembership);
      }
    } else {
      hasMembership = Boolean(hasMembership);
    }

    state.activeProfileUser = { id, username, displayName, avatarColor, role, bio, avatarUrl, hasMembership };

    setAvatarContent(el.profileModalAvatar, { displayName, username, avatarColor, avatarUrl });
    const isTargetAdmin = role === 'admin' || isBokitPrimary;
    el.profileBadgeRole.textContent = isBokitPrimary ? 'ADMIN & OWNER' : (isTargetAdmin ? 'ADMIN' : (role || 'MEMBER').toUpperCase());
    el.profileBadgeRole.className = 'badge-role';
    if (isBokitPrimary) {
      el.profileBadgeRole.classList.add('owner');
    } else if (isTargetAdmin) {
      el.profileBadgeRole.classList.add('admin');
    }

    if (el.profileBadgeMembership) {
      el.profileBadgeMembership.classList.toggle('hidden', !hasMembership);
    }

    // Non-admin self profile: show the "$5 monthly to stop ads" button
    if (el.profileStopAdsSection) {
      const isCurrentUserAdmin = Boolean(state.user && (state.user.role === 'admin' || isUserBokit()));
      if (isSelf && !isCurrentUserAdmin) {
        el.profileStopAdsSection.classList.remove('hidden');
        if (el.profileStopAdsNotice) {
          el.profileStopAdsNotice.classList.add('hidden');
        }
        if (el.profileStopAdsBtnText) {
          el.profileStopAdsBtnText.textContent = hasMembership
            ? '💎 Active Membership ($5/Monthly — Ads Stopped)'
            : 'You have to pay $5 monthly to stop ads';
        }
      } else {
        el.profileStopAdsSection.classList.add('hidden');
      }
    }

    el.profileModalDisplayname.textContent = displayName || username;
    el.profileModalUsername.textContent = `@${username}`;
    el.profileBtnUsernameTarget.textContent = username;
    if (el.profileBtnChatTarget) {
      el.profileBtnChatTarget.textContent = username;
    }
    el.profileModalBio.textContent = bio || 'No bio provided.';

    // Reset bio editing UI
    if (el.profileBioEditWrap) {
      el.profileBioEditWrap.classList.add('hidden');
    }
    if (el.profileModalBio) {
      el.profileModalBio.classList.remove('hidden');
    }
    if (el.profileBioStatus) {
      el.profileBioStatus.textContent = '';
      el.profileBioStatus.className = 'profile-bio-status';
    }

    // Allow editing bio if viewing own profile OR if logged-in user is bokit
    const canEditBio = isSelf || isBokit;
    if (el.btnEditBio) {
      if (canEditBio) {
        el.btnEditBio.classList.remove('hidden');
        el.btnEditBio.title = isSelf ? 'Edit About Me' : `Edit About Me for @${username} (Admin)`;
      } else {
        el.btnEditBio.classList.add('hidden');
      }
    }

    // Bokit-Only No-Ads Membership Toggle button (strictly only the bokit account can give/revoke membership)
    if (el.btnProfileToggleMembership) {
      if (isBokit && !isBokitPrimary) {
        el.btnProfileToggleMembership.classList.remove('hidden');
        if (el.profileBtnMembershipText) {
          el.profileBtnMembershipText.textContent = hasMembership
            ? 'Revoke Membership (No Ads)'
            : 'Give Membership (No Ads)';
        }
        el.btnProfileToggleMembership.title = hasMembership
          ? `Revoke No-Ads Membership from @${username}`
          : `Grant No-Ads Membership ($5/Monthly) to @${username}`;
      } else {
        el.btnProfileToggleMembership.classList.add('hidden');
      }
    }

    // Admin Role Toggle button (Bokit only, on other users)
    if (el.btnProfileToggleAdmin) {
      if (isBokit && !isSelf && !isBokitPrimary) {
        el.btnProfileToggleAdmin.classList.remove('hidden');
        if (role === 'admin') {
          el.profileBtnAdminText.textContent = 'Revoke Admin Role';
          el.btnProfileToggleAdmin.className = 'btn btn-secondary btn-block';
          el.btnProfileToggleAdmin.title = `Remove administrator privileges from @${username}`;
        } else {
          el.profileBtnAdminText.textContent = 'Grant Admin Role';
          el.btnProfileToggleAdmin.className = 'btn btn-blurple btn-block';
          el.btnProfileToggleAdmin.title = `Promote @${username} to server administrator`;
        }
      } else {
        el.btnProfileToggleAdmin.classList.add('hidden');
      }
    }

    // Admin Delete User button
    if (el.btnProfileDeleteUser) {
      if (isBokit && !isSelf && !isBokitPrimary) {
        el.btnProfileDeleteUser.classList.remove('hidden');
      } else {
        el.btnProfileDeleteUser.classList.add('hidden');
      }
    }

    // Self avatar actions and overlay
    if (el.profileAvatarWrapper) {
      if (isSelf) {
        el.profileAvatarWrapper.classList.add('can-edit');
      } else {
        el.profileAvatarWrapper.classList.remove('can-edit');
      }
    }
    if (el.profileAvatarOverlay) {
      if (isSelf) {
        el.profileAvatarOverlay.classList.remove('hidden');
      } else {
        el.profileAvatarOverlay.classList.add('hidden');
      }
    }
    if (el.profileAvatarActions) {
      if (isSelf) {
        el.profileAvatarActions.classList.remove('hidden');
        if (el.btnProfileRemoveAvatar) {
          if (avatarUrl) {
            el.btnProfileRemoveAvatar.classList.remove('hidden');
          } else {
            el.btnProfileRemoveAvatar.classList.add('hidden');
          }
        }
        if (el.profileAvatarStatus) {
          el.profileAvatarStatus.textContent = '';
          el.profileAvatarStatus.className = 'profile-avatar-status';
        }
      } else {
        el.profileAvatarActions.classList.add('hidden');
      }
    }

    // If viewing self, hide actions
    if (isSelf) {
      el.btnProfileAddFriend.classList.add('hidden');
      if (el.btnProfileStartChat) el.btnProfileStartChat.classList.add('hidden');
    } else {
      // Check if already a friend
      const isFriend = state.friends && state.friends.some((f) => f.friend && f.friend.id === id && f.status === 'accepted');
      if (isFriend) {
        el.btnProfileAddFriend.classList.add('hidden');
      } else {
        el.btnProfileAddFriend.classList.remove('hidden');
      }

      // Show start chat button for other user / friend
      if (el.btnProfileStartChat) {
        el.btnProfileStartChat.classList.remove('hidden');
      }
    }

    // Self Name / Username Edit Actions
    if (el.profileNameEditSection) {
      if (isSelf) {
        el.profileNameEditSection.classList.remove('hidden');
        if (el.profileNameEditForm) el.profileNameEditForm.classList.add('hidden');
        if (el.nameEditToggleLabel) el.nameEditToggleLabel.textContent = 'Change Name';
        if (el.inputEditDisplayName) el.inputEditDisplayName.value = displayName || username || '';
        if (el.inputEditUsername) el.inputEditUsername.value = username || '';
        if (el.profileNameFeedback) {
          el.profileNameFeedback.textContent = '';
          el.profileNameFeedback.className = 'profile-name-feedback';
        }
        checkNameChangeStatus();
      } else {
        el.profileNameEditSection.classList.add('hidden');
      }
    }

    el.modalUserProfile.classList.remove('hidden');
  }

  function closeProfileModal() {
    el.modalUserProfile.classList.add('hidden');
  }

  // ============================================================================
  // IMAGE ATTACHMENTS & LIGHTBOX HELPERS
  // ============================================================================

  function stageImageFile(file) {
    if (!file) return;
    if (!file.type || !file.type.startsWith('image/')) {
      alert('Only image files (PNG, JPG, GIF, WebP, SVG) are allowed.');
      return;
    }
    if (file.size > 16 * 1024 * 1024) {
      alert('Image is too large. Maximum file size is 16MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      state.stagedImage = {
        file,
        dataUrl,
        name: file.name,
        size: file.size,
      };

      if (el.chatImagePreviewThumb) el.chatImagePreviewThumb.src = dataUrl;
      if (el.chatImagePreviewName) el.chatImagePreviewName.textContent = file.name;
      if (el.chatImagePreviewSize) el.chatImagePreviewSize.textContent = formatFileSize(file.size);
      if (el.chatImagePreviewTray) el.chatImagePreviewTray.classList.remove('hidden');
      if (el.chatInputText) el.chatInputText.focus();
    };
    reader.readAsDataURL(file);
  }

  function clearStagedImage() {
    state.stagedImage = null;
    if (el.inputChatImage) el.inputChatImage.value = '';
    if (el.chatImagePreviewThumb) el.chatImagePreviewThumb.src = '';
    if (el.chatImagePreviewTray) el.chatImagePreviewTray.classList.add('hidden');
  }

  function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function openLightbox(url, name) {
    if (!el.modalImageLightbox || !url) return;
    if (el.lightboxImg) el.lightboxImg.src = url;
    if (el.lightboxFilename) el.lightboxFilename.textContent = name || 'Image';
    if (el.lightboxDownloadLink) {
      el.lightboxDownloadLink.href = url;
      el.lightboxDownloadLink.setAttribute('download', name || 'image');
    }
    el.modalImageLightbox.classList.remove('hidden');
  }

  function closeLightbox() {
    if (!el.modalImageLightbox) return;
    el.modalImageLightbox.classList.add('hidden');
    if (el.lightboxImg) el.lightboxImg.src = '';
  }

  // ============================================================================
  // USER PROFILE NAME CHANGE & 30-DAY COOLDOWN HELPERS
  // ============================================================================

  async function checkNameChangeStatus() {
    if (!state.token || !el.profileNameStatusBadge || !el.profileNameCooldownText) return;
    el.profileNameCooldownText.textContent = 'Checking cooldown status...';
    el.profileNameStatusBadge.className = 'name-status-badge checking';

    try {
      const res = await fetch('/api/users/name-status', {
        headers: { 'Authorization': `Bearer ${state.token}` }
      });
      const data = await res.json();
      state.nameChangeStatus = data;

      if (data.isAdmin) {
        el.profileNameStatusBadge.className = 'name-status-badge admin-bypass';
        el.profileNameStatusBadge.innerHTML = `<span class="badge-icon">👑</span> <div><strong>Admin Bypass:</strong> No cooldown active. You can change names without restriction.</div>`;
        if (el.btnSaveNameEdit) el.btnSaveNameEdit.disabled = false;
      } else if (data.canChange) {
        el.profileNameStatusBadge.className = 'name-status-badge ready';
        el.profileNameStatusBadge.innerHTML = `<span class="badge-icon">✓</span> <div><strong>Ready to change name:</strong> You may change your name now. Note that a 30-day cooldown timer will begin immediately upon saving.</div>`;
        if (el.btnSaveNameEdit) el.btnSaveNameEdit.disabled = false;
      } else {
        el.profileNameStatusBadge.className = 'name-status-badge on-cooldown';
        const days = data.remainingDays !== undefined ? data.remainingDays : (data.days !== undefined ? data.days : 0);
        const hours = data.remainingHours !== undefined ? data.remainingHours : (data.hours !== undefined ? data.hours : 0);
        const timeStr = days > 0 ? `${days} day${days === 1 ? '' : 's'} and ${hours} hour${hours === 1 ? '' : 's'}` : `${hours} hour${hours === 1 ? '' : 's'}`;
        el.profileNameStatusBadge.innerHTML = `<span class="badge-icon">⏳</span> <div><strong>30-Day Cooldown Active:</strong> You cannot change your name for another <strong>${timeStr}</strong>. Only admins are exempt.</div>`;
        if (el.btnSaveNameEdit) el.btnSaveNameEdit.disabled = true;
      }
    } catch (err) {
      console.error('Failed to query name change status:', err);
      el.profileNameStatusBadge.className = 'name-status-badge';
      el.profileNameCooldownText.textContent = 'Could not verify cooldown timer status.';
    }
  }

  async function saveNameChange() {
    if (!state.user || !state.token) return;
    const newDisplayName = (el.inputEditDisplayName ? el.inputEditDisplayName.value : '').trim();
    const newUsername = (el.inputEditUsername ? el.inputEditUsername.value : '').trim();

    if (!newUsername) {
      showNameFeedback('Username cannot be blank.', 'error');
      return;
    }
    if (newUsername.length < 3 || newUsername.length > 24) {
      showNameFeedback('Username must be between 3 and 24 characters.', 'error');
      return;
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(newUsername)) {
      showNameFeedback('Username may only contain letters, numbers, underscores, hyphens, and dots.', 'error');
      return;
    }

    if (el.btnSaveNameEdit) {
      el.btnSaveNameEdit.disabled = true;
      el.btnSaveNameEdit.textContent = 'Saving...';
    }
    showNameFeedback('Saving changes...', 'info');

    try {
      const res = await fetch('/api/users/change-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({
          displayName: newDisplayName || newUsername,
          username: newUsername
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNameFeedback('✅ Name changed successfully!', 'success');
        if (data.user) {
          state.user = { ...state.user, ...data.user };
          localStorage.setItem('bokit_user', JSON.stringify(state.user));

          // Update profile modal text
          if (el.profileModalDisplayname) el.profileModalDisplayname.textContent = state.user.displayName || state.user.username;
          if (el.profileModalUsername) el.profileModalUsername.textContent = `@${state.user.username}`;
          if (el.profileBtnUsernameTarget) el.profileBtnUsernameTarget.textContent = state.user.username;
          if (el.profileBtnChatTarget) el.profileBtnChatTarget.textContent = state.user.username;

          // Update user panels
          if (el.userPanelDisplayname) el.userPanelDisplayname.textContent = state.user.displayName || state.user.username;
          if (el.userPanelUsername) el.userPanelUsername.textContent = `@${state.user.username}`;
          if (el.navbarUserName) el.navbarUserName.textContent = state.user.displayName || state.user.username;
          setAvatarContent(el.userPanelAvatar, state.user);
          setAvatarContent(el.profileModalAvatar, state.user);
          if (el.navbarUserAvatar) setAvatarContent(el.navbarUserAvatar, state.user);
        }

        // Recheck cooldown status
        await checkNameChangeStatus();

        setTimeout(() => {
          if (el.profileNameEditForm) el.profileNameEditForm.classList.add('hidden');
          if (el.nameEditToggleLabel) el.nameEditToggleLabel.textContent = 'Change Name';
        }, 1200);
      } else {
        showNameFeedback(data.message || 'Failed to update name.', 'error');
        if (state.nameChangeStatus && !state.nameChangeStatus.isAdmin && !state.nameChangeStatus.canChange) {
          if (el.btnSaveNameEdit) el.btnSaveNameEdit.disabled = true;
        } else {
          if (el.btnSaveNameEdit) el.btnSaveNameEdit.disabled = false;
        }
      }
    } catch (err) {
      console.error('Error changing name:', err);
      showNameFeedback('Network error while saving name change.', 'error');
      if (el.btnSaveNameEdit) el.btnSaveNameEdit.disabled = false;
    } finally {
      if (el.btnSaveNameEdit) el.btnSaveNameEdit.textContent = 'Save Name';
    }
  }

  function showNameFeedback(msg, type) {
    if (!el.profileNameFeedback) return;
    el.profileNameFeedback.textContent = msg;
    el.profileNameFeedback.className = `profile-name-feedback ${type}`;
  }

  // ============================================================================
  // UTILITIES & FORMATTERS
  // ============================================================================

  function formatTimestamp(isoStr) {
    if (!isoStr) return '';
    const date = new Date(isoStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (isToday) {
      return `Today at ${timeStr}`;
    }
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
  }

  function parseSimpleMarkdown(text) {
    if (!text) return '';
    let escaped = escapeHtml(text);
    // Everyone mention pill
    escaped = escaped.replace(/@everyone\b/g, '<span class="mention-everyone">@everyone</span>');
    // Bold: **text**
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text*
    escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Inline code: `text`
    escaped = escaped.replace(/`(.*?)`/g, '<code style="background:var(--bg-tertiary); padding:2px 5px; border-radius:3px; font-size:12.5px;">$1</code>');
    // Line breaks
    escaped = escaped.replace(/\n/g, '<br/>');
    return escaped;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function scrollToBottom() {
    el.messageStream.scrollTop = el.messageStream.scrollHeight;
  }

  function isUserBokit() {
    return !!(state.user && state.user.username && state.user.username.toLowerCase() === 'bokit');
  }

  function updateChatInputPermissions() {
    if (!el.chatInputText) return;
    const isBokit = isUserBokit();

    if (state.currentView === 'channels' && state.currentChannelId === 'announcements') {
      if (!isBokit) {
        el.chatInputText.disabled = true;
        el.chatInputText.placeholder = 'You do not have permission to send messages in #announcements.';
        if (el.btnOpenEmbedModal) el.btnOpenEmbedModal.style.display = 'none';
        if (el.btnSendMessage) el.btnSendMessage.disabled = true;
      } else {
        el.chatInputText.disabled = false;
        el.chatInputText.placeholder = 'Message #announcements (Official Announcement)';
        if (el.btnOpenEmbedModal) el.btnOpenEmbedModal.style.display = '';
        if (el.btnSendMessage) el.btnSendMessage.disabled = false;
      }
    } else {
      el.chatInputText.disabled = false;
      if (el.btnOpenEmbedModal) el.btnOpenEmbedModal.style.display = '';
      if (el.btnSendMessage) el.btnSendMessage.disabled = false;
      if (state.currentView === 'dm' && state.currentDmRecipient) {
        el.chatInputText.placeholder = `Message @${state.currentDmRecipient.displayName || state.currentDmRecipient.username} (or click 'Embed' to send rich embed)`;
      } else {
        const ch = (state.channels && state.channels.find((c) => c.id === state.currentChannelId)) || { name: state.currentChannelId || 'general' };
        el.chatInputText.placeholder = `Message #${ch.name} (or click 'Embed' to send rich embed)`;
      }
    }
  }

  function checkMentionAutocomplete() {
    if (!isUserBokit()) {
      hideMentionAutocomplete();
      return;
    }
    const val = el.chatInputText ? el.chatInputText.value : '';
    const cursorPos = el.chatInputText ? (el.chatInputText.selectionStart ?? val.length) : val.length;
    const textBefore = val.slice(0, cursorPos);
    const match = textBefore.match(/(?:^|\s)@([a-zA-Z]*)$/);
    if (match) {
      const query = match[1].toLowerCase();
      if ('everyone'.startsWith(query)) {
        showMentionAutocomplete(match[1]);
        return;
      }
    }
    hideMentionAutocomplete();
  }

  function showMentionAutocomplete(query) {
    if (!el.mentionAutocompletePopup) return;
    if (el.mentionQueryDisplay) {
      el.mentionQueryDisplay.textContent = query ? `@${query}` : '@';
    }
    el.mentionAutocompletePopup.classList.remove('hidden');
  }

  function hideMentionAutocomplete() {
    if (el.mentionAutocompletePopup) {
      el.mentionAutocompletePopup.classList.add('hidden');
    }
  }

  function insertEveryoneMention() {
    if (!el.chatInputText) return;
    const val = el.chatInputText.value;
    const cursorPos = el.chatInputText.selectionStart ?? val.length;
    const textBefore = val.slice(0, cursorPos);
    const textAfter = val.slice(cursorPos);
    const match = textBefore.match(/(?:^|\s)@([a-zA-Z]*)$/);
    if (match) {
      const atIndex = textBefore.lastIndexOf('@');
      const newTextBefore = textBefore.slice(0, atIndex) + '@everyone ';
      el.chatInputText.value = newTextBefore + textAfter;
      const newPos = newTextBefore.length;
      el.chatInputText.focus();
      el.chatInputText.setSelectionRange(newPos, newPos);
    } else {
      el.chatInputText.value = val + '@everyone ';
      el.chatInputText.focus();
    }
    hideMentionAutocomplete();
  }

  function removeActiveTyper(channelId, username) {
    if (state.activeTypers && state.activeTypers[channelId] && state.activeTypers[channelId][username]) {
      clearTimeout(state.activeTypers[channelId][username].timer);
      delete state.activeTypers[channelId][username];
      if (channelId === state.currentChannelId) {
        updateTypingIndicatorDisplay();
      }
    }
  }

  function updateTypingIndicatorDisplay() {
    if (!el.typingIndicator || !el.typingText) return;
    const typersObj = (state.activeTypers && state.activeTypers[state.currentChannelId]) || {};
    const typers = Object.values(typersObj).map((t) => escapeHtml(t.displayName));

    if (typers.length === 0) {
      el.typingIndicator.classList.add('hidden');
      el.typingText.innerHTML = '';
      return;
    }

    let text = '';
    if (typers.length === 1) {
      text = `<strong>${typers[0]}</strong> is typing...`;
    } else if (typers.length === 2) {
      text = `<strong>${typers[0]}</strong> and <strong>${typers[1]}</strong> are typing...`;
    } else if (typers.length === 3) {
      text = `<strong>${typers[0]}</strong>, <strong>${typers[1]}</strong>, and <strong>${typers[2]}</strong> are typing...`;
    } else {
      text = 'Several people are typing...';
    }

    el.typingText.innerHTML = text;
    el.typingIndicator.classList.remove('hidden');
  }

  function showTypingIndicator(text) {
    if (!el.typingIndicator || !el.typingText) return;
    el.typingText.innerHTML = text;
    el.typingIndicator.classList.remove('hidden');
  }

  // ============================================================================
  // WEB PROXY (SCRAMJET & LIBCURL & WISP) CONTROLS
  // ============================================================================

  function switchAppTab(tab) {
    if (el.navTabChat) el.navTabChat.classList.toggle('active', tab === 'chat');
    if (el.navTabProxy) el.navTabProxy.classList.toggle('active', tab === 'proxy');
    if (el.navTabUpdates) el.navTabUpdates.classList.toggle('active', tab === 'updates');
    if (el.navTabEditor) el.navTabEditor.classList.toggle('active', tab === 'editor');
    if (el.navTabGames) el.navTabGames.classList.toggle('active', tab === 'games');
    if (el.navTabMovies) el.navTabMovies.classList.toggle('active', tab === 'movies');

    el.discordView.classList.toggle('hidden', tab !== 'chat');
    if (el.proxyView) el.proxyView.classList.toggle('hidden', tab !== 'proxy');
    if (el.updatesView) el.updatesView.classList.toggle('hidden', tab !== 'updates');
    if (el.editorView) el.editorView.classList.toggle('hidden', tab !== 'editor');
    if (el.gamesView) el.gamesView.classList.toggle('hidden', tab !== 'games');
    if (el.moviesView) el.moviesView.classList.toggle('hidden', tab !== 'movies');

    if (tab === 'updates') {
      loadUpdateRequests();
    } else if (tab === 'editor') {
      if (typeof onEditorTabOpened === 'function') {
        onEditorTabOpened();
      }
    } else if (tab === 'games') {
      try {
        document.cookie = '__scramjet_active_origin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      } catch (e) {}
      loadGamesList();
    } else if (tab === 'movies') {
      loadMoviesList();
    }
  }

  // Search Engine & Tab Cloaker Presets
  const TAB_CLOAK_PRESETS = {
    default: {
      title: 'BokitCord — Community Chat',
      favicon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%235865F2'><path d='M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z'/></svg>"
    },
    classroom: {
      title: 'Classes',
      favicon: 'https://ssl.gstatic.com/classroom/favicon.png'
    },
    drive: {
      title: 'My Drive - Google Drive',
      favicon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png'
    },
    canvas: {
      title: 'Dashboard - Canvas LMS',
      favicon: 'https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico'
    },
    aaa: {
      title: 'My Account | AAA Driving Course',
      favicon: 'https://www.aaadrivingcourse.com/favicon.ico'
    }
  };

  function applyTabCloak(key) {
    const preset = TAB_CLOAK_PRESETS[key] || TAB_CLOAK_PRESETS.default;
    document.title = preset.title;
    let fav = document.getElementById('tab-favicon');
    if (!fav) {
      fav = document.createElement('link');
      fav.id = 'tab-favicon';
      fav.rel = 'icon';
      document.head.appendChild(fav);
    }
    fav.href = preset.favicon;
    try {
      localStorage.setItem('bokit_tab_cloak', key);
    } catch (e) {}
  }

  function buildSearchUrl(query) {
    const engine = el.selectSearchEngine ? el.selectSearchEngine.value : 'duckduckgo';
    const q = encodeURIComponent(query);
    switch (engine) {
      case 'google':
        return `https://www.google.com/search?q=${q}`;
      case 'bing':
        return `https://www.bing.com/search?q=${q}`;
      case 'brave':
        return `https://search.brave.com/search?q=${q}`;
      case 'yahoo':
        return `https://search.yahoo.com/search?q=${q}`;
      case 'duckduckgo':
      default:
        return `https://duckduckgo.com/?q=${q}`;
    }
  }

  function navigateProxy(rawInput) {
    if (!rawInput) return;
    let url = rawInput.trim();
    if (!/^https?:\/\//i.test(url)) {
      if (url.includes('.') && !url.includes(' ')) {
        url = 'https://' + url;
      } else {
        url = buildSearchUrl(url);
      }
    }
    let hash = '';
    try {
      const u = new URL(url);
      hash = u.hash || '';
    } catch(e) {}
    const proxyGatewayUrl = `/browser/gateway?url=${encodeURIComponent(url)}${hash}`;
    if (el.proxyIframe) {
      el.proxyIframe.allow = 'fullscreen; autoplay; gamepad; picture-in-picture; camera; microphone;';
      el.proxyIframe.src = proxyGatewayUrl;
    }
    if (el.proxyHomePage) el.proxyHomePage.classList.add('hidden');
    if (el.proxyViewportContainer) el.proxyViewportContainer.classList.remove('hidden');
    if (el.proxyControlBar) el.proxyControlBar.classList.remove('hidden');
    if (el.inputProxyUrl) el.inputProxyUrl.value = url;
    if (el.inputPzSearch) el.inputPzSearch.value = url;
  }

  function openStealthPopout() {
    const currentSrc = (el.proxyIframe && el.proxyIframe.src && el.proxyIframe.src !== 'about:blank')
      ? el.proxyIframe.src
      : `${window.location.origin}/browser/gateway?url=${encodeURIComponent('https://duckduckgo.com')}`;

    const newWin = window.open('about:blank', '_blank');
    if (!newWin) {
      alert('Pop-up blocked! Please allow popups for this site to use Stealth Popout.');
      return;
    }

    const currentCloak = (el.selectTabCloaker && el.selectTabCloaker.value) || 'default';
    const preset = TAB_CLOAK_PRESETS[currentCloak] || TAB_CLOAK_PRESETS.default;

    const doc = newWin.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${preset.title}</title>
        <link rel="icon" href="${preset.favicon}" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }
          iframe { width: 100%; height: 100%; border: none; display: block; }
        </style>
      </head>
      <body>
        <iframe src="${currentSrc}" allow="fullscreen; autoplay; gamepad; picture-in-picture; camera; microphone;"></iframe>
      </body>
      </html>
    `);
    doc.close();
  }

  // ============================================================================
  // PETEZAH HELPER FUNCTIONS (Clock, Custom Shortcuts)
  // ============================================================================

  function updatePzClock() {
    if (!el.pzLiveClock) return;
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    const formattedHour = hours ? hours.toString().padStart(2, '0') : '12';
    el.pzLiveClock.textContent = `${formattedHour}:${minutes} ${ampm}`;
  }

  function getCustomShortcuts() {
    try {
      const data = localStorage.getItem('pz_custom_shortcuts');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCustomShortcuts(list) {
    try {
      localStorage.setItem('pz_custom_shortcuts', JSON.stringify(list));
    } catch (e) {}
  }

  function addCustomShortcut(title, url) {
    const list = getCustomShortcuts();
    list.push({ title, url });
    saveCustomShortcuts(list);
    renderCustomShortcuts();
  }

  function removeCustomShortcut(index) {
    const list = getCustomShortcuts();
    list.splice(index, 1);
    saveCustomShortcuts(list);
    renderCustomShortcuts();
  }

  function renderCustomShortcuts() {
    if (!el.pzCustomShortcutsRow) return;
    const list = getCustomShortcuts();
    if (list.length === 0) {
      el.pzCustomShortcutsRow.classList.add('hidden');
      el.pzCustomShortcutsRow.innerHTML = '';
      return;
    }
    el.pzCustomShortcutsRow.classList.remove('hidden');
    el.pzCustomShortcutsRow.innerHTML = '';
    list.forEach((sc, idx) => {
      const pill = document.createElement('div');
      pill.className = 'pz-custom-shortcut-pill';
      pill.innerHTML = `
        <span>📌 ${escapeHtml(sc.title)}</span>
        <span class="pz-custom-shortcut-remove" title="Remove">&times;</span>
      `;
      pill.addEventListener('click', (e) => {
        if (e.target.classList.contains('pz-custom-shortcut-remove')) {
          e.stopPropagation();
          removeCustomShortcut(idx);
        } else {
          navigateProxy(sc.url);
        }
      });
      el.pzCustomShortcutsRow.appendChild(pill);
    });
  }

  function setupProxyListeners() {
    if (el.navTabChat) {
      el.navTabChat.addEventListener('click', () => switchAppTab('chat'));
    }
    if (el.navTabProxy) {
      el.navTabProxy.addEventListener('click', () => switchAppTab('proxy'));
    }
    if (el.navTabUpdates) {
      el.navTabUpdates.addEventListener('click', () => switchAppTab('updates'));
    }
    if (el.navTabEditor) {
      el.navTabEditor.addEventListener('click', () => switchAppTab('editor'));
    }
    if (el.navTabGames) {
      el.navTabGames.addEventListener('click', () => switchAppTab('games'));
    }
    if (el.navTabMovies) {
      el.navTabMovies.addEventListener('click', () => switchAppTab('movies'));
    }

    // Restore saved Tab Cloak if present
    try {
      const savedCloak = localStorage.getItem('bokit_tab_cloak');
      if (savedCloak && TAB_CLOAK_PRESETS[savedCloak]) {
        if (el.selectTabCloaker) el.selectTabCloaker.value = savedCloak;
        applyTabCloak(savedCloak);
      }
    } catch (e) {}

    // Tab Cloaker selection
    if (el.selectTabCloaker) {
      el.selectTabCloaker.addEventListener('change', () => {
        applyTabCloak(el.selectTabCloaker.value);
      });
    }

    // Stealth Popout button
    if (el.btnProxyStealthPopout) {
      el.btnProxyStealthPopout.addEventListener('click', openStealthPopout);
    }

    // GBA Emulator quick button
    if (el.btnProxyQuickGba) {
      el.btnProxyQuickGba.addEventListener('click', () => {
        navigateProxy('https://gba.js.org/');
      });
    }

    // Scramjet in-page client controller message listener (syncs omnibox & title)
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'scramjet_navigated') {
        if (event.data.url && el.inputProxyUrl) {
          el.inputProxyUrl.value = event.data.url;
        }
        if (event.data.url && el.inputPzSearch) {
          el.inputPzSearch.value = event.data.url;
        }
        if (el.selectTabCloaker && el.selectTabCloaker.value === 'default' && event.data.title) {
          document.title = `${event.data.title} — BokitCord`;
        }
      }
    });

    if (el.navbarWispStat) {
      el.navbarWispStat.addEventListener('click', () => {
        switchAppTab('proxy');
        if (el.wispDiagnosticsDrawer) el.wispDiagnosticsDrawer.classList.toggle('open');
      });
    }

    if (el.btnToggleWispPanel && el.wispDiagnosticsDrawer) {
      el.btnToggleWispPanel.addEventListener('click', () => {
        el.wispDiagnosticsDrawer.classList.toggle('open');
      });
    }

    // Active Browsing Omnibox form submission
    if (el.formProxyOmnibox && el.inputProxyUrl) {
      el.formProxyOmnibox.addEventListener('submit', (e) => {
        e.preventDefault();
        navigateProxy(el.inputProxyUrl.value);
      });
    }

    // ============================================================================
    // PETEZAH NEW TAB EVENT LISTENERS
    // ============================================================================

    // PeteZah Center Search Form
    if (el.formPzSearch && el.inputPzSearch) {
      el.formPzSearch.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = el.inputPzSearch.value.trim();
        if (q) navigateProxy(q);
      });
    }

    // Ctrl+K Shortcut Handler
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (el.proxyHomePage && !el.proxyHomePage.classList.contains('hidden') && el.inputPzSearch) {
          el.inputPzSearch.focus();
          el.inputPzSearch.select();
        } else if (el.inputProxyUrl) {
          el.inputProxyUrl.focus();
          el.inputProxyUrl.select();
        }
      }
    });

    // PeteZah Category Buttons
    if (el.pzCatGames) {
      el.pzCatGames.addEventListener('click', () => navigateProxy('https://gba.js.org/'));
    }
    if (el.pzCatApps && el.modalPzApps) {
      el.pzCatApps.addEventListener('click', () => el.modalPzApps.classList.remove('hidden'));
    }
    if (el.pzCatMusic) {
      el.pzCatMusic.addEventListener('click', () => navigateProxy('https://open.spotify.com'));
    }
    if (el.pzCatMovies) {
      el.pzCatMovies.addEventListener('click', () => switchAppTab('movies'));
    }
    if (el.pzCatFilm) {
      el.pzCatFilm.addEventListener('click', () => switchAppTab('movies'));
    }
    if (el.pzCatTv) {
      el.pzCatTv.addEventListener('click', () => navigateProxy('https://www.twitch.tv'));
    }
    if (el.pzCatDrive) {
      el.pzCatDrive.addEventListener('click', () => navigateProxy('https://drive.google.com'));
    }
    if (el.pzCatChat) {
      el.pzCatChat.addEventListener('click', () => switchAppTab('chat'));
    }
    if (el.pzCatAdd && el.modalPzAdd) {
      el.pzCatAdd.addEventListener('click', () => el.modalPzAdd.classList.remove('hidden'));
    }

    // PeteZah Floating Dock Buttons
    document.querySelectorAll('.pz-dock-btn[data-url]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.url;
        if (target) navigateProxy(target);
      });
    });
    if (el.btnPzDockAdd && el.modalPzAdd) {
      el.btnPzDockAdd.addEventListener('click', () => el.modalPzAdd.classList.remove('hidden'));
    }

    // PeteZah Trending Modal Open/Close
    const openTrendingModal = () => {
      if (el.modalPzTrending) el.modalPzTrending.classList.remove('hidden');
    };
    if (el.btnPzTrending) el.btnPzTrending.addEventListener('click', openTrendingModal);
    if (el.btnPzFooterTrending) el.btnPzFooterTrending.addEventListener('click', openTrendingModal);
    if (el.btnClosePzTrending && el.modalPzTrending) {
      el.btnClosePzTrending.addEventListener('click', () => el.modalPzTrending.classList.add('hidden'));
    }

    // Trending & App Cards in Modals Click Listener
    document.querySelectorAll('.pz-trend-card').forEach((card) => {
      card.addEventListener('click', () => {
        const target = card.dataset.url;
        if (target) {
          if (el.modalPzTrending) el.modalPzTrending.classList.add('hidden');
          if (el.modalPzApps) el.modalPzApps.classList.add('hidden');
          navigateProxy(target);
        }
      });
    });

    // PeteZah Discord Pill & Footer Link
    if (el.btnPzDiscord) el.btnPzDiscord.addEventListener('click', () => switchAppTab('chat'));
    if (el.pzLinkDiscord) {
      el.pzLinkDiscord.addEventListener('click', (e) => {
        e.preventDefault();
        switchAppTab('chat');
      });
    }

    // PeteZah Get Links Modal
    if (el.btnPzGetLinks && el.modalPzLinks) {
      el.btnPzGetLinks.addEventListener('click', () => {
        if (el.pzDisplayLocalMirror) {
          el.pzDisplayLocalMirror.textContent = window.location.origin;
        }
        el.modalPzLinks.classList.remove('hidden');
      });
    }
    if (el.btnClosePzLinks && el.modalPzLinks) {
      el.btnClosePzLinks.addEventListener('click', () => el.modalPzLinks.classList.add('hidden'));
    }
    if (el.btnClosePzApps && el.modalPzApps) {
      el.btnClosePzApps.addEventListener('click', () => el.modalPzApps.classList.add('hidden'));
    }

    // Copy links in Get Links modal
    document.querySelectorAll('.pz-copy-link-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const textToCopy = btn.dataset.copy || window.location.origin;
        navigator.clipboard.writeText(textToCopy).then(() => {
          const prev = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = prev; }, 1800);
        }).catch(() => {});
      });
    });
    if (el.btnCopyLocalMirror) {
      el.btnCopyLocalMirror.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.origin).then(() => {
          el.btnCopyLocalMirror.textContent = 'Copied!';
          setTimeout(() => { el.btnCopyLocalMirror.textContent = 'Copy'; }, 1800);
        }).catch(() => {});
      });
    }

    // PeteZah Add Custom Shortcut Modal
    if (el.btnClosePzAdd && el.modalPzAdd) {
      el.btnClosePzAdd.addEventListener('click', () => el.modalPzAdd.classList.add('hidden'));
    }
    if (el.btnCancelPzAdd && el.modalPzAdd) {
      el.btnCancelPzAdd.addEventListener('click', () => el.modalPzAdd.classList.add('hidden'));
    }
    if (el.formPzAddShortcut) {
      el.formPzAddShortcut.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = el.inputPzShortcutTitle.value.trim();
        const url = el.inputPzShortcutUrl.value.trim();
        if (title && url) {
          addCustomShortcut(title, url);
          el.inputPzShortcutTitle.value = '';
          el.inputPzShortcutUrl.value = '';
          if (el.modalPzAdd) el.modalPzAdd.classList.add('hidden');
        }
      });
    }
    renderCustomShortcuts();

    // PeteZah Engine Selector Dropdown
    if (el.pzEngineTrigger && el.pzEngineDropdown) {
      el.pzEngineTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        el.pzEngineDropdown.classList.toggle('hidden');
        el.pzEngineTrigger.parentElement.classList.toggle('open');
      });

      document.querySelectorAll('.pz-engine-option').forEach((opt) => {
        opt.addEventListener('click', (e) => {
          e.stopPropagation();
          const engine = opt.dataset.engine;
          if (engine && el.selectSearchEngine) {
            el.selectSearchEngine.value = engine;
            if (el.pzEngineCurrentName) {
              const nameMap = {
                duckduckgo: 'Default',
                google: 'Google',
                bing: 'Bing',
                brave: 'Brave',
                yahoo: 'Yahoo'
              };
              el.pzEngineCurrentName.textContent = nameMap[engine] || 'Default';
            }
            document.querySelectorAll('.pz-engine-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
          }
          el.pzEngineDropdown.classList.add('hidden');
          el.pzEngineTrigger.parentElement.classList.remove('open');
        });
      });

      document.addEventListener('click', () => {
        if (el.pzEngineDropdown) el.pzEngineDropdown.classList.add('hidden');
        if (el.pzEngineTrigger && el.pzEngineTrigger.parentElement) {
          el.pzEngineTrigger.parentElement.classList.remove('open');
        }
      });
    }

    // PeteZah Legal Modals (ToS, Privacy, DMCA)
    const showLegalInfo = (type) => {
      if (!el.modalPzInfo || !el.pzInfoTitle || !el.pzInfoBody) return;
      if (type === 'tos') {
        el.pzInfoTitle.textContent = 'Terms of Service';
        el.pzInfoBody.innerHTML = `
          <p><strong>Welcome to Dead Bokitware &amp; BokitCord Web Browser</strong></p>
          <p style="margin-top:8px;">By using this service, you agree to access content responsibly. This service provides private, encrypted web proxying and educational web gaming intended for personal productivity and research.</p>
          <p style="margin-top:8px;">Do not use this network to distribute malware, engage in malicious attacks, or violate local laws and regulations.</p>
        `;
      } else if (type === 'privacy') {
        el.pzInfoTitle.textContent = 'Privacy Policy';
        el.pzInfoBody.innerHTML = `
          <p><strong>Zero-Log Private Browsing</strong></p>
          <p style="margin-top:8px;">Your web traffic routed through our Scramjet &amp; Libcurl engine is streamed directly in-memory via encrypted WebSocket multiplexing. No browsing history, queries, or visited domains are stored on our servers.</p>
          <p style="margin-top:8px;">Cookies and site cache remain isolated in client-side memory during your active session.</p>
        `;
      } else if (type === 'dmca') {
        el.pzInfoTitle.textContent = 'DMCA &amp; Content Policy';
        el.pzInfoBody.innerHTML = `
          <p><strong>Digital Millennium Copyright Act Notice</strong></p>
          <p style="margin-top:8px;">Dead Bokitware operates as an interactive proxy and conduit under 17 U.S.C. § 512. All games and web applications are loaded dynamically from remote origin servers.</p>
          <p style="margin-top:8px;">To request removal of any indexed links or resources, please reach out directly through BokitCord administration.</p>
        `;
      }
      el.modalPzInfo.classList.remove('hidden');
    };

    if (el.pzLinkTos) el.pzLinkTos.addEventListener('click', (e) => { e.preventDefault(); showLegalInfo('tos'); });
    if (el.pzLinkPrivacy) el.pzLinkPrivacy.addEventListener('click', (e) => { e.preventDefault(); showLegalInfo('privacy'); });
    if (el.pzLinkDmca) el.pzLinkDmca.addEventListener('click', (e) => { e.preventDefault(); showLegalInfo('dmca'); });
    if (el.btnClosePzInfo && el.modalPzInfo) {
      el.btnClosePzInfo.addEventListener('click', () => el.modalPzInfo.classList.add('hidden'));
    }

    // Start Live Clock
    updatePzClock();
    setInterval(updatePzClock, 1000);

    // Proxy Navigation Buttons
    if (el.btnProxyBack) {
      el.btnProxyBack.addEventListener('click', () => {
        try {
          if (el.proxyIframe && el.proxyIframe.contentWindow) {
            el.proxyIframe.contentWindow.history.back();
          }
        } catch (e) {
          console.warn('Iframe history navigation restricted by origin policy');
        }
      });
    }

    if (el.btnProxyForward) {
      el.btnProxyForward.addEventListener('click', () => {
        try {
          if (el.proxyIframe && el.proxyIframe.contentWindow) {
            el.proxyIframe.contentWindow.history.forward();
          }
        } catch (e) {
          console.warn('Iframe history navigation restricted by origin policy');
        }
      });
    }

    if (el.btnProxyRefresh) {
      el.btnProxyRefresh.addEventListener('click', () => {
        if (el.proxyIframe && el.proxyIframe.src && el.proxyIframe.src !== 'about:blank') {
          el.proxyIframe.src = el.proxyIframe.src;
        }
      });
    }

    if (el.btnProxyHome) {
      el.btnProxyHome.addEventListener('click', () => {
        if (el.proxyIframe) el.proxyIframe.src = 'about:blank';
        if (el.proxyControlBar) el.proxyControlBar.classList.add('hidden');
        if (el.proxyViewportContainer) {
          el.proxyViewportContainer.classList.add('hidden');
        }
        if (el.proxyHomePage) el.proxyHomePage.classList.remove('hidden');
        if (el.inputProxyUrl) el.inputProxyUrl.value = '';
        if (el.inputPzSearch) el.inputPzSearch.value = '';
      });
    }

    // Wisp Ping Button
    if (el.btnPingWisp) {
      el.btnPingWisp.addEventListener('click', pingWisp);
    }
  }

  async function pingWisp() {
    if (!el.wispPingResult || !el.wispPingText) return;
    const dot = el.wispPingResult.querySelector('.ping-dot');
    if (dot) dot.className = 'ping-dot active';
    el.wispPingText.textContent = 'Pinging Wisp server via WebSocket...';

    const t0 = performance.now();
    let replied = false;

    try {
      const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProto}//${window.location.host}/wisp/`;
      const ws = new WebSocket(wsUrl);

      const timer = setTimeout(() => {
        if (!replied) {
          try { ws.close(); } catch (e) {}
          fallbackHttpPing(t0);
        }
      }, 2500);

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      };

      ws.onmessage = (evt) => {
        replied = true;
        clearTimeout(timer);
        const rtt = Math.round(performance.now() - t0);
        if (dot) dot.className = 'ping-dot success';
        el.wispPingText.innerHTML = `<strong>Connected!</strong> Wisp WebSocket RTT: <strong>${rtt} ms</strong> (Protocol: Wisp v1 / Libcurl Transport)`;
        try { ws.close(); } catch (e) {}
      };

      ws.onerror = () => {
        if (!replied) {
          clearTimeout(timer);
          fallbackHttpPing(t0);
        }
      };
    } catch (err) {
      fallbackHttpPing(t0);
    }
  }

  async function fallbackHttpPing(t0) {
    if (!el.wispPingResult || !el.wispPingText) return;
    const dot = el.wispPingResult.querySelector('.ping-dot');
    try {
      const res = await fetch('/wisp/ping');
      const rtt = Math.round(performance.now() - t0);
      const data = await res.json();
      if (res.ok && data.status === 'online') {
        if (dot) dot.className = 'ping-dot success';
        el.wispPingText.innerHTML = `<strong>Online!</strong> Wisp Gateway RTT: <strong>${rtt} ms</strong> (Status: ${data.status}, Transport: Libcurl)`;
      } else {
        throw new Error('Non-200 ping');
      }
    } catch (err) {
      if (dot) dot.className = 'ping-dot error';
      el.wispPingText.innerHTML = `<span style="color:var(--status-red);">Wisp server offline or unreachable</span>`;
    }
  }

  // ============================================================================
  // COMMUNITY UPDATE REQUESTS & SUGGESTIONS
  // ============================================================================

  let updateRequestsList = [];
  const updateRequestsFilter = {
    category: 'all',
    status: 'all',
    sort: 'popular',
    search: '',
  };

  function setupUpdateRequestsListeners() {
    // Open Submit Request Modal
    if (el.btnOpenSubmitUpdateReq) {
      el.btnOpenSubmitUpdateReq.addEventListener('click', () => {
        if (!state.user) {
          alert('Please log in to submit an update request.');
          return;
        }
        openSubmitUpdateReqModal();
      });
    }

    // Close Modals
    if (el.btnCloseUpdateReq) el.btnCloseUpdateReq.addEventListener('click', closeSubmitUpdateReqModal);
    if (el.btnCancelUpdateReq) el.btnCancelUpdateReq.addEventListener('click', closeSubmitUpdateReqModal);
    if (el.btnCloseAdminUpdateReq) el.btnCloseAdminUpdateReq.addEventListener('click', closeAdminUpdateReqModal);
    if (el.btnCancelAdminUpdateReq) el.btnCancelAdminUpdateReq.addEventListener('click', closeAdminUpdateReqModal);

    // Description character counter
    if (el.inputUpdateReqDesc && el.updateReqCharCount) {
      el.inputUpdateReqDesc.addEventListener('input', () => {
        const len = el.inputUpdateReqDesc.value.length;
        el.updateReqCharCount.textContent = `${len}/2000`;
        el.updateReqCharCount.classList.toggle('warning', len >= 2000);
      });
    }

    // Submit Request Form
    if (el.formAddUpdateReq) {
      el.formAddUpdateReq.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = (el.inputUpdateReqTitle ? el.inputUpdateReqTitle.value : '').trim();
        const category = el.selectUpdateReqCategory ? el.selectUpdateReqCategory.value : 'feature';
        const description = (el.inputUpdateReqDesc ? el.inputUpdateReqDesc.value : '').trim();

        if (!title || !description) {
          showUpdateReqAlert('Please fill in both a title and description.', 'error');
          return;
        }

        if (title.length > 100) {
          showUpdateReqAlert('Title cannot exceed 100 characters.', 'error');
          return;
        }

        if (description.length > 2000) {
          showUpdateReqAlert('Description cannot exceed 2000 characters.', 'error');
          return;
        }

        if (el.btnSubmitUpdateReq) el.btnSubmitUpdateReq.disabled = true;

        try {
          const res = await fetch('/api/update-requests', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${state.token}`,
            },
            body: JSON.stringify({ title, category, description }),
          });

          const data = await res.json();
          if (res.ok && data.success) {
            closeSubmitUpdateReqModal();
            loadUpdateRequests();
          } else {
            showUpdateReqAlert(data.error || 'Failed to submit request.', 'error');
          }
        } catch (err) {
          console.error('Error submitting update request:', err);
          showUpdateReqAlert('Network error submitting request.', 'error');
        } finally {
          if (el.btnSubmitUpdateReq) el.btnSubmitUpdateReq.disabled = false;
        }
      });
    }

    // Category Filter Pills
    if (el.updatesCategoryFilters) {
      el.updatesCategoryFilters.addEventListener('click', (e) => {
        const pill = e.target.closest('.category-pill');
        if (!pill) return;
        el.updatesCategoryFilters.querySelectorAll('.category-pill').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        updateRequestsFilter.category = pill.getAttribute('data-category') || 'all';
        renderUpdateRequests();
      });
    }

    // Status & Sort Dropdowns
    if (el.selectUpdatesStatus) {
      el.selectUpdatesStatus.addEventListener('change', () => {
        updateRequestsFilter.status = el.selectUpdatesStatus.value;
        renderUpdateRequests();
      });
    }

    if (el.selectUpdatesSort) {
      el.selectUpdatesSort.addEventListener('change', () => {
        updateRequestsFilter.sort = el.selectUpdatesSort.value;
        loadUpdateRequests();
      });
    }

    // Search Input
    if (el.inputUpdatesSearch) {
      el.inputUpdatesSearch.addEventListener('input', () => {
        updateRequestsFilter.search = el.inputUpdatesSearch.value.trim().toLowerCase();
        renderUpdateRequests();
      });
    }

    // Admin Moderate Form (Save Status & Response)
    if (el.formAdminUpdateReq) {
      el.formAdminUpdateReq.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = el.inputAdminReqId ? el.inputAdminReqId.value : '';
        const status = el.selectAdminReqStatus ? el.selectAdminReqStatus.value : 'pending';
        const adminResponse = el.inputAdminReqResponse ? el.inputAdminReqResponse.value.trim() : '';

        if (!id) return;
        if (el.btnSaveAdminUpdateReq) el.btnSaveAdminUpdateReq.disabled = true;

        try {
          const res = await fetch(`/api/update-requests/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${state.token}`,
            },
            body: JSON.stringify({ status, adminResponse }),
          });

          const data = await res.json();
          if (res.ok && data.success) {
            closeAdminUpdateReqModal();
            const idx = updateRequestsList.findIndex((r) => r.id === id);
            if (idx !== -1) {
              updateRequestsList[idx] = data.request;
              renderUpdateRequests();
              updateRequestsStats();
            }
          } else {
            showAdminReqAlert(data.error || 'Failed to update request.', 'error');
          }
        } catch (err) {
          console.error('Error saving admin update:', err);
          showAdminReqAlert('Network error saving request.', 'error');
        } finally {
          if (el.btnSaveAdminUpdateReq) el.btnSaveAdminUpdateReq.disabled = false;
        }
      });
    }

    // Admin Delete Request Button
    if (el.btnAdminReqDelete) {
      el.btnAdminReqDelete.addEventListener('click', async () => {
        const id = el.inputAdminReqId ? el.inputAdminReqId.value : '';
        if (!id) return;
        if (!confirm('Are you sure you want to permanently delete this update request?')) return;

        try {
          const res = await fetch(`/api/update-requests/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${state.token}` },
          });

          const data = await res.json();
          if (res.ok && data.success) {
            closeAdminUpdateReqModal();
            updateRequestsList = updateRequestsList.filter((r) => r.id !== id);
            renderUpdateRequests();
            updateRequestsStats();
          } else {
            showAdminReqAlert(data.error || 'Failed to delete request.', 'error');
          }
        } catch (err) {
          console.error('Error deleting update request:', err);
          showAdminReqAlert('Network error deleting request.', 'error');
        }
      });
    }

    // Modal close on Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (el.modalAddUpdateReq && !el.modalAddUpdateReq.classList.contains('hidden')) {
          closeSubmitUpdateReqModal();
        } else if (el.modalAdminUpdateReq && !el.modalAdminUpdateReq.classList.contains('hidden')) {
          closeAdminUpdateReqModal();
        }
      }
    });
  }

  function openSubmitUpdateReqModal() {
    if (!el.modalAddUpdateReq) return;
    if (el.formAddUpdateReq) el.formAddUpdateReq.reset();
    if (el.updateReqCharCount) el.updateReqCharCount.textContent = '0/2000';
    hideUpdateReqAlert();
    el.modalAddUpdateReq.classList.remove('hidden');
    if (el.inputUpdateReqTitle) el.inputUpdateReqTitle.focus();
  }

  function closeSubmitUpdateReqModal() {
    if (!el.modalAddUpdateReq) return;
    el.modalAddUpdateReq.classList.add('hidden');
    hideUpdateReqAlert();
  }

  function showUpdateReqAlert(msg, type = 'error') {
    if (!el.updateReqAlert || !el.updateReqAlertContent) return;
    el.updateReqAlert.className = `auth-alert ${type}`;
    el.updateReqAlertContent.textContent = msg;
    el.updateReqAlert.classList.remove('hidden');
  }

  function hideUpdateReqAlert() {
    if (!el.updateReqAlert) return;
    el.updateReqAlert.classList.add('hidden');
  }

  function openAdminUpdateReqModal(req) {
    if (!el.modalAdminUpdateReq) return;
    hideAdminReqAlert();
    if (el.inputAdminReqId) el.inputAdminReqId.value = req.id;
    if (el.selectAdminReqStatus) el.selectAdminReqStatus.value = req.status || 'pending';
    if (el.inputAdminReqResponse) el.inputAdminReqResponse.value = req.adminResponse || '';
    el.modalAdminUpdateReq.classList.remove('hidden');
  }

  function closeAdminUpdateReqModal() {
    if (!el.modalAdminUpdateReq) return;
    el.modalAdminUpdateReq.classList.add('hidden');
    hideAdminReqAlert();
  }

  function showAdminReqAlert(msg, type = 'error') {
    if (!el.adminUpdateReqAlert || !el.adminUpdateReqAlertContent) return;
    el.adminUpdateReqAlert.className = `auth-alert ${type}`;
    el.adminUpdateReqAlertContent.textContent = msg;
    el.adminUpdateReqAlert.classList.remove('hidden');
  }

  function hideAdminReqAlert() {
    if (!el.adminUpdateReqAlert) return;
    el.adminUpdateReqAlert.classList.add('hidden');
  }

  async function loadUpdateRequests() {
    try {
      const queryParams = new URLSearchParams({
        sort: updateRequestsFilter.sort || 'popular',
      });
      const res = await fetch(`/api/update-requests?${queryParams.toString()}`);
      if (res.ok) {
        updateRequestsList = await res.json();
        updateRequestsStats();
        renderUpdateRequests();
      }
    } catch (err) {
      console.error('Error loading update requests:', err);
    }
  }

  function updateRequestsStats() {
    if (el.statTotalRequests) {
      el.statTotalRequests.textContent = updateRequestsList.length;
    }
    if (el.statCompletedRequests) {
      const completedCount = updateRequestsList.filter((r) => r.status === 'completed').length;
      el.statCompletedRequests.textContent = completedCount;
    }
    if (el.statPlannedRequests) {
      const plannedCount = updateRequestsList.filter((r) => r.status === 'planned' || r.status === 'in_progress').length;
      el.statPlannedRequests.textContent = plannedCount;
    }
  }

  const CATEGORY_LABELS = {
    feature: '✨ Feature',
    game: '🎮 Game Request',
    bug: '🐛 Bug Fix',
    proxy: '⚡ Proxy/Wisp',
    improvement: '🚀 Improvement',
    other: '💡 Other',
  };

  const STATUS_LABELS = {
    pending: 'Pending Review',
    under_review: 'Under Review',
    planned: 'Planned',
    in_progress: 'In Progress',
    completed: 'Completed',
    declined: 'Declined',
  };

  function renderUpdateRequests() {
    if (!el.updatesGrid) return;
    const isBokit = state.user && state.user.username && state.user.username.toLowerCase() === 'bokit';
    const currentUserId = state.user ? state.user.id : null;

    let list = [...updateRequestsList];

    // Filter by Category
    if (updateRequestsFilter.category && updateRequestsFilter.category !== 'all') {
      list = list.filter((r) => r.category === updateRequestsFilter.category);
    }

    // Filter by Status
    if (updateRequestsFilter.status && updateRequestsFilter.status !== 'all') {
      list = list.filter((r) => r.status === updateRequestsFilter.status);
    }

    // Search query
    if (updateRequestsFilter.search) {
      const q = updateRequestsFilter.search;
      list = list.filter(
        (r) =>
          (r.title && r.title.toLowerCase().includes(q)) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          (r.authorUsername && r.authorUsername.toLowerCase().includes(q))
      );
    }

    if (list.length === 0) {
      el.updatesGrid.innerHTML = `
        <div class="updates-empty-state">
          <div class="updates-empty-icon">💡</div>
          <div class="updates-empty-title">No Update Requests Found</div>
          <p>${updateRequestsFilter.search ? 'No suggestions match your search filter.' : 'Be the first to suggest a new feature or improvement!'}</p>
        </div>
      `;
      return;
    }

    el.updatesGrid.innerHTML = list
      .map((req) => {
        const reqId = escapeHtml(req.id);
        const title = escapeHtml(req.title || 'Untitled Request');
        const desc = escapeHtml(req.description || '');
        const categoryLabel = CATEGORY_LABELS[req.category] || '💡 Suggestion';
        const statusKey = req.status || 'pending';
        const statusLabel = STATUS_LABELS[statusKey] || 'Pending';
        const upvotes = Array.isArray(req.upvotes) ? req.upvotes : [];
        const hasUpvoted = currentUserId && upvotes.includes(currentUserId);
        const authorName = escapeHtml(req.authorDisplayName || req.authorUsername || 'Anonymous');
        const authorInitial = authorName.charAt(0).toUpperCase();
        const avatarBg = escapeHtml(req.authorAvatarColor || '#5865F2');
        const avatarStyle = req.authorAvatarUrl
          ? `background-image: url('${escapeHtml(req.authorAvatarUrl)}'); background-color: transparent;`
          : `background-color: ${avatarBg};`;
        const timeAgo = req.createdAt ? new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';

        const adminResponseHtml = req.adminResponse
          ? `
          <div class="update-admin-response">
            <div class="update-admin-badge">👑 Bokit Response</div>
            <p class="update-admin-text">${escapeHtml(req.adminResponse)}</p>
          </div>
        `
          : '';

        const isAuthor = currentUserId && req.authorId === currentUserId;
        const canDelete = isBokit || isAuthor;

        let actionsHtml = '';
        if (isBokit) {
          actionsHtml += `<button type="button" class="btn-card-action admin-mod-btn" data-action="moderate" data-id="${reqId}">⚙️ Moderate</button>`;
        }
        if (canDelete) {
          actionsHtml += `<button type="button" class="btn-card-action" data-action="delete" data-id="${reqId}">🗑️ Delete</button>`;
        }

        return `
          <div class="update-card" data-id="${reqId}">
            <div class="update-card-left">
              <button type="button" class="btn-upvote ${hasUpvoted ? 'upvoted' : ''}" data-id="${reqId}" title="${hasUpvoted ? 'Remove your upvote' : 'Upvote this suggestion'}">
                <span class="upvote-icon">▲</span>
                <span class="upvote-count">${upvotes.length}</span>
              </button>
            </div>
            <div class="update-card-content">
              <div class="update-card-header">
                <h3 class="update-card-title">${title}</h3>
                <div class="update-card-badges">
                  <span class="update-category-badge">${categoryLabel}</span>
                  <span class="update-status-badge status-${statusKey}">${statusLabel}</span>
                </div>
              </div>
              <p class="update-card-desc">${desc}</p>
              ${adminResponseHtml}
              <div class="update-card-footer">
                <div class="update-author-info">
                  <div class="update-author-avatar" style="${avatarStyle}">
                    ${req.authorAvatarUrl ? '' : authorInitial}
                  </div>
                  <span class="update-author-name">${authorName}</span>
                  <span>&bull;</span>
                  <span>${timeAgo}</span>
                </div>
                <div class="update-card-actions">
                  ${actionsHtml}
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    // Wire Upvote Buttons
    el.updatesGrid.querySelectorAll('.btn-upvote').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        toggleUpdateRequestUpvote(id);
      });
    });

    // Wire Card Action Buttons
    el.updatesGrid.querySelectorAll('.btn-card-action').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const action = btn.getAttribute('data-action');
        const req = updateRequestsList.find((r) => r.id === id);

        if (action === 'moderate' && req) {
          openAdminUpdateReqModal(req);
        } else if (action === 'delete' && req) {
          if (!confirm(`Are you sure you want to delete "${req.title}"?`)) return;
          try {
            const res = await fetch(`/api/update-requests/${encodeURIComponent(id)}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${state.token}` },
            });
            if (res.ok) {
              updateRequestsList = updateRequestsList.filter((r) => r.id !== id);
              renderUpdateRequests();
              updateRequestsStats();
            }
          } catch (err) {
            console.error('Delete request error:', err);
          }
        }
      });
    });
  }

  async function toggleUpdateRequestUpvote(id) {
    if (!state.user || !state.token) {
      alert('Please log in to upvote update suggestions.');
      return;
    }

    try {
      const res = await fetch(`/api/update-requests/${encodeURIComponent(id)}/upvote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const target = updateRequestsList.find((r) => r.id === id);
        if (target) {
          target.upvotes = data.upvotes;
          renderUpdateRequests();
        }
      }
    } catch (err) {
      console.error('Error toggling upvote:', err);
    }
  }

  function handleUpdateRequestCreated(newReq) {
    const exists = updateRequestsList.some((r) => r.id === newReq.id);
    if (!exists) {
      updateRequestsList.unshift(newReq);
      updateRequestsStats();
      renderUpdateRequests();
    }
  }

  function handleUpdateRequestUpdated(updatedReq) {
    const idx = updateRequestsList.findIndex((r) => r.id === updatedReq.id);
    if (idx !== -1) {
      updateRequestsList[idx] = updatedReq;
      updateRequestsStats();
      renderUpdateRequests();
    }
  }

  function handleUpdateRequestDeleted({ id }) {
    updateRequestsList = updateRequestsList.filter((r) => r.id !== id);
    updateRequestsStats();
    renderUpdateRequests();
  }

  // ============================================================================
  // HTML & JS CODE PLAYGROUND
  // ============================================================================

  const editorState = {
    currentLang: 'html',
    autorun: true,
    autorunTimer: null,
    logCount: 0,
  };

  const EDITOR_TEMPLATES = {
    starter: {
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>BokitWare Interactive App</title>
</head>
<body>
  <div class="card">
    <div class="logo">⚡</div>
    <h1>Hello, BokitWare!</h1>
    <p>Write HTML, CSS, and JS live with instant preview & console logs.</p>
    <button id="btn-click">Clicks: <span id="counter">0</span></button>
  </div>
</body>
</html>`,
      css: `body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.card {
  background: #1e293b;
  padding: 36px 32px;
  border-radius: 18px;
  text-align: center;
  border: 1px solid #334155;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  max-width: 360px;
}

.logo {
  font-size: 38px;
  margin-bottom: 8px;
}

h1 {
  margin: 0 0 10px;
  font-size: 22px;
  color: #38bdf8;
}

p {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 24px;
}

button {
  background: #38bdf8;
  color: #0f172a;
  border: none;
  font-weight: 800;
  font-size: 14px;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.1s ease, background 0.15s ease;
}

button:hover {
  background: #7dd3fc;
  transform: scale(1.05);
}

button:active {
  transform: scale(0.95);
}`,
      js: `console.log('App started successfully!');

let clicks = 0;
const btn = document.getElementById('btn-click');
const counter = document.getElementById('counter');

btn.addEventListener('click', () => {
  clicks++;
  counter.textContent = clicks;
  console.log('Button clicked! Total:', clicks);
});`,
    },

    canvas: {
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Particle Web</title>
</head>
<body>
  <canvas id="canvas"></canvas>
</body>
</html>`,
      css: `body, html {
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #020617;
}

canvas {
  display: block;
}`,
      js: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let w = canvas.width = window.innerWidth;
let h = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
});

const particles = [];
for (let i = 0; i < 60; i++) {
  particles.push({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    r: Math.random() * 2 + 1.5
  });
}

function animate() {
  ctx.clearRect(0, 0, w, h);

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > w) p.vx *= -1;
    if (p.y < 0 || p.y > h) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();

    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j];
      const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
      if (dist < 100) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = \`rgba(56, 189, 248, \${1 - dist / 100})\`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animate);
}

animate();
console.log('Canvas Particle Simulation running!');`,
    },

    clicker: {
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Cookie Clicker Mini</title>
</head>
<body>
  <div class="game-wrap">
    <h1>🍪 Byte Clicker</h1>
    <div id="score" class="score">0 Bytes</div>
    <button id="btn-cookie" class="cookie-btn">🍪</button>
    <div class="shop">
      <button id="btn-upgrade">Buy Auto-Clicker (+1/sec) &bull; Cost: <span id="upgrade-cost">15</span></button>
    </div>
  </div>
</body>
</html>`,
      css: `body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #18181b;
  color: #fff;
  font-family: sans-serif;
  user-select: none;
}

.game-wrap {
  text-align: center;
  background: #27272a;
  padding: 32px;
  border-radius: 20px;
  border: 1px solid #3f3f46;
  box-shadow: 0 16px 36px rgba(0,0,0,0.6);
}

.score {
  font-size: 28px;
  font-weight: 800;
  color: #eab308;
  margin-bottom: 20px;
}

.cookie-btn {
  font-size: 80px;
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
  transition: transform 0.08s ease;
}

.cookie-btn:active {
  transform: scale(0.88);
}

.shop button {
  margin-top: 24px;
  background: #3b82f6;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.shop button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}`,
      js: `let bytes = 0;
let autoClickers = 0;
let upgradeCost = 15;

const scoreEl = document.getElementById('score');
const cookieBtn = document.getElementById('btn-cookie');
const upgradeBtn = document.getElementById('btn-upgrade');
const costEl = document.getElementById('upgrade-cost');

cookieBtn.addEventListener('click', () => {
  bytes++;
  updateUI();
});

upgradeBtn.addEventListener('click', () => {
  if (bytes >= upgradeCost) {
    bytes -= upgradeCost;
    autoClickers++;
    upgradeCost = Math.floor(upgradeCost * 1.4);
    console.log(\`Bought Auto-Clicker! Current: \${autoClickers}\`);
    updateUI();
  }
});

setInterval(() => {
  if (autoClickers > 0) {
    bytes += autoClickers;
    updateUI();
  }
}, 1000);

function updateUI() {
  scoreEl.textContent = \`\${bytes} Bytes\`;
  costEl.textContent = upgradeCost;
  upgradeBtn.disabled = bytes < upgradeCost;
}

console.log('Byte Clicker loaded!');`,
    },

    blank: {
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>My Project</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>`,
      css: `body {
  font-family: sans-serif;
  margin: 20px;
}`,
      js: `console.log('Hello from code playground!');`,
    },
  };

  function setupEditorListeners() {
    // Tab switching between HTML, CSS, JS
    const tabs = [
      { btn: el.tabEditorHtml, lang: 'html', textarea: el.editorTextareaHtml, label: 'HTML (Tab indents)' },
      { btn: el.tabEditorCss, lang: 'css', textarea: el.editorTextareaCss, label: 'CSS (Tab indents)' },
      { btn: el.tabEditorJs, lang: 'js', textarea: el.editorTextareaJs, label: 'JavaScript (Tab indents)' },
    ];

    tabs.forEach(({ btn, lang, textarea, label }) => {
      if (!btn) return;
      btn.addEventListener('click', () => {
        tabs.forEach((t) => {
          if (t.btn) t.btn.classList.remove('active');
          if (t.textarea) t.textarea.classList.add('hidden');
        });
        btn.classList.add('active');
        if (textarea) textarea.classList.remove('hidden');
        editorState.currentLang = lang;
        if (el.editorCursorPos) el.editorCursorPos.textContent = label;
        if (textarea) textarea.focus();
      });
    });

    // Tab key indent handling & Auto-run on input
    const textareas = [el.editorTextareaHtml, el.editorTextareaCss, el.editorTextareaJs];
    textareas.forEach((ta) => {
      if (!ta) return;
      ta.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = ta.selectionStart;
          const end = ta.selectionEnd;
          ta.value = ta.value.substring(0, start) + '  ' + ta.value.substring(end);
          ta.selectionStart = ta.selectionEnd = start + 2;
          triggerEditorAutoSave();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          runEditorCode();
        }
      });

      ta.addEventListener('input', () => {
        triggerEditorAutoSave();
      });
    });

    // Run button
    if (el.btnEditorRun) {
      el.btnEditorRun.addEventListener('click', () => runEditorCode());
    }

    // Auto-Run toggle
    if (el.btnEditorAutorun) {
      el.btnEditorAutorun.addEventListener('click', () => {
        editorState.autorun = !editorState.autorun;
        el.btnEditorAutorun.classList.toggle('active', editorState.autorun);
        try {
          localStorage.setItem('bokitcord_code_autorun', editorState.autorun ? 'true' : 'false');
        } catch (e) {}
      });
    }

    // Template selector
    if (el.selectEditorTemplate) {
      el.selectEditorTemplate.addEventListener('change', () => {
        const val = el.selectEditorTemplate.value;
        if (!val || !EDITOR_TEMPLATES[val]) return;
        loadEditorTemplate(val);
        el.selectEditorTemplate.value = '';
      });
    }

    // Clear button
    if (el.btnEditorClear) {
      el.btnEditorClear.addEventListener('click', () => {
        if (!confirm('Clear all code in HTML, CSS, and JS tabs?')) return;
        if (el.editorTextareaHtml) el.editorTextareaHtml.value = '';
        if (el.editorTextareaCss) el.editorTextareaCss.value = '';
        if (el.editorTextareaJs) el.editorTextareaJs.value = '';
        saveDraftCode();
        runEditorCode();
      });
    }

    // Download Single HTML File
    if (el.btnEditorDownload) {
      el.btnEditorDownload.addEventListener('click', downloadBundledHtml);
    }

    // Popout Preview in new window
    if (el.btnEditorPopout) {
      el.btnEditorPopout.addEventListener('click', openEditorPopout);
    }

    // Refresh Preview button
    if (el.btnRefreshPreview) {
      el.btnRefreshPreview.addEventListener('click', () => runEditorCode());
    }

    // Toggle Console panel
    if (el.btnToggleConsole) {
      el.btnToggleConsole.addEventListener('click', () => {
        if (el.editorConsolePanel) {
          el.editorConsolePanel.classList.toggle('hidden');
        }
      });
    }

    // Clear Console
    if (el.btnClearConsole) {
      el.btnClearConsole.addEventListener('click', clearEditorConsole);
    }

    // Listen for console logs from iframe
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'editor_console') {
        appendConsoleLog(event.data.level, event.data.message);
      }
    });

    // Load saved drafts or starter template
    loadDraftCode();
  }

  function onEditorTabOpened() {
    // When switching to the editor tab, trigger a run to ensure preview is rendered
    runEditorCode();
  }

  function triggerEditorAutoSave() {
    saveDraftCode();
    if (el.editorSaveIndicator) {
      el.editorSaveIndicator.textContent = '💾 Draft Saved';
      setTimeout(() => {
        if (el.editorSaveIndicator) el.editorSaveIndicator.textContent = '💾 Draft Auto-Saved';
      }, 1500);
    }

    if (editorState.autorun) {
      clearTimeout(editorState.autorunTimer);
      editorState.autorunTimer = setTimeout(() => {
        runEditorCode();
      }, 500);
    }
  }

  function saveDraftCode() {
    try {
      if (el.editorTextareaHtml) localStorage.setItem('bokitcord_code_html', el.editorTextareaHtml.value);
      if (el.editorTextareaCss) localStorage.setItem('bokitcord_code_css', el.editorTextareaCss.value);
      if (el.editorTextareaJs) localStorage.setItem('bokitcord_code_js', el.editorTextareaJs.value);
    } catch (e) {}
  }

  function loadDraftCode() {
    try {
      const savedHtml = localStorage.getItem('bokitcord_code_html');
      const savedCss = localStorage.getItem('bokitcord_code_css');
      const savedJs = localStorage.getItem('bokitcord_code_js');
      const savedAutorun = localStorage.getItem('bokitcord_code_autorun');

      if (savedAutorun !== null) {
        editorState.autorun = savedAutorun === 'true';
        if (el.btnEditorAutorun) el.btnEditorAutorun.classList.toggle('active', editorState.autorun);
      }

      if (savedHtml !== null || savedCss !== null || savedJs !== null) {
        if (el.editorTextareaHtml) el.editorTextareaHtml.value = savedHtml || '';
        if (el.editorTextareaCss) el.editorTextareaCss.value = savedCss || '';
        if (el.editorTextareaJs) el.editorTextareaJs.value = savedJs || '';
      } else {
        // Load default starter template
        loadEditorTemplate('starter');
      }
    } catch (e) {
      loadEditorTemplate('starter');
    }
  }

  function loadEditorTemplate(name) {
    const tpl = EDITOR_TEMPLATES[name];
    if (!tpl) return;
    if (el.editorTextareaHtml) el.editorTextareaHtml.value = tpl.html;
    if (el.editorTextareaCss) el.editorTextareaCss.value = tpl.css;
    if (el.editorTextareaJs) el.editorTextareaJs.value = tpl.js;
    saveDraftCode();
    runEditorCode();
  }

  function buildBundledCode(includeConsoleBridge = true) {
    const html = el.editorTextareaHtml ? el.editorTextareaHtml.value : '';
    const css = el.editorTextareaCss ? el.editorTextareaCss.value : '';
    const js = el.editorTextareaJs ? el.editorTextareaJs.value : '';

    const consoleBridgeScript = includeConsoleBridge
      ? `
  <script>
    (function() {
      function send(type, args) {
        try {
          var serialized = Array.prototype.slice.call(args).map(function(a) {
            if (typeof a === 'object') {
              try { return JSON.stringify(a); } catch(e) { return String(a); }
            }
            return String(a);
          }).join(' ');
          window.parent.postMessage({ type: 'editor_console', level: type, message: serialized }, '*');
        } catch(e) {}
      }
      var origLog = console.log, origWarn = console.warn, origError = console.error, origInfo = console.info;
      console.log = function() { send('info', arguments); origLog && origLog.apply(console, arguments); };
      console.warn = function() { send('warn', arguments); origWarn && origWarn.apply(console, arguments); };
      console.error = function() { send('error', arguments); origError && origError.apply(console, arguments); };
      console.info = function() { send('info', arguments); origInfo && origInfo.apply(console, arguments); };
      window.onerror = function(msg, url, line, col, err) {
        send('error', ['Uncaught Error: ' + msg + ' (Line ' + line + ')']);
      };
    })();
  <\/script>
`
      : '';

    // If the HTML already has a <body> or </head>, inject nicely
    let bundle = '';
    if (html.includes('</head>')) {
      bundle = html.replace('</head>', `<style>\n${css}\n</style>\n${consoleBridgeScript}</head>`);
    } else {
      bundle = `<style>\n${css}\n</style>\n${consoleBridgeScript}\n${html}`;
    }

    if (bundle.includes('</body>')) {
      bundle = bundle.replace('</body>', `<script>\n${js}\n<\/script>\n</body>`);
    } else {
      bundle += `\n<script>\n${js}\n<\/script>`;
    }

    return bundle;
  }

  function runEditorCode() {
    if (!el.editorPreviewFrame) return;
    clearEditorConsole();

    const fullBundle = buildBundledCode(true);
    el.editorPreviewFrame.srcdoc = fullBundle;
  }

  function downloadBundledHtml() {
    const bundle = buildBundledCode(false);
    const blob = new Blob([bundle], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bokitware_app.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function openEditorPopout() {
    const bundle = buildBundledCode(false);
    const win = window.open('about:blank', '_blank');
    if (win) {
      win.document.open();
      win.document.write(bundle);
      win.document.close();
    } else {
      alert('Popout blocked by browser. Please allow popups for this site.');
    }
  }

  function clearEditorConsole() {
    editorState.logCount = 0;
    if (el.editorConsoleLogs) {
      el.editorConsoleLogs.innerHTML = `<div class="console-empty-tip">Console output will appear here...</div>`;
    }
    if (el.consoleBadge) {
      el.consoleBadge.textContent = '0';
      el.consoleBadge.classList.add('hidden');
    }
  }

  function appendConsoleLog(level, message) {
    if (!el.editorConsoleLogs) return;

    // Remove empty tip if present
    const tip = el.editorConsoleLogs.querySelector('.console-empty-tip');
    if (tip) tip.remove();

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const entry = document.createElement('div');
    entry.className = `console-log-entry console-log-${level}`;

    entry.innerHTML = `
      <span class="console-time">${time}</span>
      <span class="console-msg">${escapeHtml(message)}</span>
    `;

    el.editorConsoleLogs.appendChild(entry);
    el.editorConsoleLogs.scrollTop = el.editorConsoleLogs.scrollHeight;

    editorState.logCount++;
    if (el.consoleBadge) {
      el.consoleBadge.textContent = editorState.logCount;
      el.consoleBadge.classList.remove('hidden');
    }
  }

  // ============================================================================
  // GAMES & ARCADE LOGIC
  // ============================================================================

  let currentGameData = null;
  let allLoadedGames = [];
  let currentCategoryFilter = 'all';
  let currentSearchQuery = '';

  function setupGamesListeners() {
    if (el.btnGameBack) {
      el.btnGameBack.addEventListener('click', () => {
        closeGamePlayer();
      });
    }

    if (el.btnGameReload) {
      el.btnGameReload.addEventListener('click', () => {
        if (currentGameData) {
          launchGame(currentGameData);
        }
      });
    }

    if (el.btnGameFullscreen) {
      el.btnGameFullscreen.addEventListener('click', () => {
        if (!el.gamePlayerFrame) return;
        if (el.gamePlayerFrame.requestFullscreen) {
          el.gamePlayerFrame.requestFullscreen();
        } else if (el.gamePlayerFrame.webkitRequestFullscreen) {
          el.gamePlayerFrame.webkitRequestFullscreen();
        } else if (el.gamePlayerFrame.msRequestFullscreen) {
          el.gamePlayerFrame.msRequestFullscreen();
        }
      });
    }

    if (el.btnGamePopout) {
      el.btnGamePopout.addEventListener('click', () => {
        if (currentGameData && currentGameData.url) {
          window.open(currentGameData.url, '_blank');
        }
      });
    }

    // Search input handler
    if (el.gamesSearchInput) {
      el.gamesSearchInput.addEventListener('input', (e) => {
        currentSearchQuery = (e.target.value || '').trim().toLowerCase();
        if (el.btnClearGamesSearch) {
          el.btnClearGamesSearch.classList.toggle('hidden', !currentSearchQuery);
        }
        applyGamesFilter();
      });
    }

    // Clear search button
    if (el.btnClearGamesSearch) {
      el.btnClearGamesSearch.addEventListener('click', () => {
        if (el.gamesSearchInput) {
          el.gamesSearchInput.value = '';
          el.gamesSearchInput.focus();
        }
        el.btnClearGamesSearch.classList.add('hidden');
        currentSearchQuery = '';
        applyGamesFilter();
      });
    }

    // Category pills filter
    if (el.gamesCategoryPills) {
      el.gamesCategoryPills.addEventListener('click', (e) => {
        const pill = e.target.closest('.category-pill');
        if (!pill) return;

        const filter = pill.getAttribute('data-filter') || 'all';
        currentCategoryFilter = filter;

        // Update active class on pills
        el.gamesCategoryPills.querySelectorAll('.category-pill').forEach((btn) => {
          btn.classList.toggle('active', btn === pill);
        });

        applyGamesFilter();
      });
    }
  }

  function matchesCategory(game, category) {
    if (category === 'all') return true;
    const text = `${game.name || ''} ${game.type || ''} ${game.description || ''}`.toLowerCase();
    if (category === 'riddle') return text.includes('riddle') || text.includes('transfer');
    if (category === 'horror') return text.includes('horror') || text.includes('baldi') || text.includes('candy') || text.includes('freddy') || text.includes('fnaf') || text.includes('fright') || text.includes('burger') || text.includes('arthur') || text.includes('nightmare');
    if (category === 'action') return text.includes('action') || text.includes('shooter') || text.includes('roguelike') || text.includes('boxing') || text.includes('basket') || text.includes('mayhem') || text.includes('hazard') || text.includes('doom') || text.includes('fps') || text.includes('hobo') || text.includes('brawl') || text.includes('vice city') || text.includes('gta');
    if (category === 'driving') return text.includes('driving') || text.includes('drive') || text.includes('physics driving') || text.includes('vice city') || text.includes('gta');
    if (category === 'adventure') return text.includes('adventure') || text.includes('story') || text.includes('minecraft') || text.includes('sandbox') || text.includes('riddle');
    if (category === 'puzzle') return text.includes('puzzle') || text.includes('math') || text.includes('block') || text.includes('riddle');
    return text.includes(category);
  }

  function applyGamesFilter() {
    let filtered = allLoadedGames;

    if (currentCategoryFilter !== 'all') {
      filtered = filtered.filter((game) => matchesCategory(game, currentCategoryFilter));
    }

    if (currentSearchQuery) {
      filtered = filtered.filter((game) => {
        const title = (game.name || '').toLowerCase();
        const type = (game.type || '').toLowerCase();
        const desc = (game.description || '').toLowerCase();
        return title.includes(currentSearchQuery) || type.includes(currentSearchQuery) || desc.includes(currentSearchQuery);
      });
    }

    if (el.gamesCountBadge) {
      el.gamesCountBadge.textContent = `${filtered.length} Game${filtered.length === 1 ? '' : 's'} Available`;
    }

    renderGamesGrid(filtered);
  }

  async function loadGamesList() {
    if (!el.gamesGrid) return;

    if (window.__EMBEDDED_GAMES__ && Array.isArray(window.__EMBEDDED_GAMES__) && window.__EMBEDDED_GAMES__.length > 0) {
      allLoadedGames = window.__EMBEDDED_GAMES__;
      applyGamesFilter();
      return;
    }

    try {
      let res;
      try {
        res = await fetch('/api/games');
        if (!res.ok) throw new Error();
      } catch (e1) {
        try {
          res = await fetch('./games.json');
          if (!res.ok) throw new Error();
        } catch (e2) {
          res = await fetch('./api_games.json');
        }
      }
      if (!res || !res.ok) throw new Error(`Failed to fetch games list`);
      const games = await res.json();

      allLoadedGames = Array.isArray(games) ? games : [];
      applyGamesFilter();
    } catch (err) {
      console.error('[Games] Error loading games list:', err);
      if (window.__EMBEDDED_GAMES__ && Array.isArray(window.__EMBEDDED_GAMES__)) {
        allLoadedGames = window.__EMBEDDED_GAMES__;
      } else {
        allLoadedGames = [
          {
            id: 'minus3',
            name: '-3',
            type: 'Unity WebGL',
            url: '/games/minus3/index.html',
            coverUrl: '/games/minus3/cover.png',
            description: 'Surreal Baldi mod by Mauzer2137. Challenge your math and reflexes in -3!',
            icon: '🕹️'
          }
        ];
      }
      applyGamesFilter();
    }
  }

  function renderGamesGrid(games) {
    if (!el.gamesGrid) return;
    el.gamesGrid.innerHTML = '';

    if (!Array.isArray(games) || games.length === 0) {
      if (el.gamesEmptyState) el.gamesEmptyState.classList.remove('hidden');
      return;
    }

    if (el.gamesEmptyState) el.gamesEmptyState.classList.add('hidden');

    games.forEach((game, index) => {
      const card = document.createElement('div');
      card.className = 'game-card';
      card.setAttribute('data-game-id', game.id);
      card.style.animationDelay = `${index * 40}ms`;

      const icon = game.icon || '🎮';
      const type = game.type || 'WebGL';
      const desc = game.description || 'Interactive WebGL game. Click play to start!';

      const coverSrc = game.coverUrl || game.cover;
      const bannerContent = coverSrc
        ? `<img src="${escapeHtml(coverSrc)}" alt="${escapeHtml(game.name || game.title)}" class="game-card-img" loading="lazy" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='flex';" /><span class="game-card-banner-icon" style="display:none;">${icon}</span>`
        : `<span class="game-card-banner-icon">${icon}</span>`;

      card.innerHTML = `
        <div class="game-card-banner">
          ${bannerContent}
          <span class="game-card-type-tag">${escapeHtml(type)}</span>
        </div>
        <div class="game-card-body">
          <h3 class="game-card-title">${escapeHtml(game.name)}</h3>
          <p class="game-card-desc">${escapeHtml(desc)}</p>
          <div class="game-card-footer">
            <button type="button" class="btn-play-game">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Play Now</span>
            </button>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        launchGame(game);
      });

      el.gamesGrid.appendChild(card);
    });
  }

  // ============================================================================
  // MONETAG CONFIG & ZERO-AD SYSTEM (All Ads Disabled)
  // ============================================================================

  const monetagConfig = {
    verificationTag: '',
    zoneId: '',
    scriptUrl: '',
    directLink: '',
    autoOpen: false,
  };

  // Clear any previously saved ad configuration
  try {
    localStorage.removeItem('monetag_auto_open');
    localStorage.removeItem('monetag_direct_link');
    localStorage.removeItem('monetag_script_url');
    localStorage.removeItem('monetag_zone_id');
    localStorage.removeItem('monetag_verification_tag');
  } catch (e) {}

  let interstitialTimer = null;
  let onInterstitialFinishedCallback = null;

  function applyMonetagConfig() {
    if (el.monetagInputTag) el.monetagInputTag.value = '';
    if (el.monetagInputZone) el.monetagInputZone.value = '';
    if (el.monetagInputDirect) el.monetagInputDirect.value = '';
    if (el.monetagInputAutoOpen) el.monetagInputAutoOpen.checked = false;

    if (el.monetagStatusBadge) {
      el.monetagStatusBadge.textContent = 'Ad-Free Gaming Enabled';
      el.monetagStatusBadge.style.background = '#23a55a';
    }
  }

  function setupMonetagListeners() {
    applyMonetagConfig();

    // Compliance Modals: Privacy Policy
    if (el.btnOpenPrivacyPolicy) {
      el.btnOpenPrivacyPolicy.addEventListener('click', () => {
        if (el.modalPrivacyPolicy) el.modalPrivacyPolicy.classList.remove('hidden');
      });
    }
    if (el.btnClosePrivacyPolicy) {
      el.btnClosePrivacyPolicy.addEventListener('click', () => {
        if (el.modalPrivacyPolicy) el.modalPrivacyPolicy.classList.add('hidden');
      });
    }
    if (el.btnAcceptPrivacy) {
      el.btnAcceptPrivacy.addEventListener('click', () => {
        if (el.modalPrivacyPolicy) el.modalPrivacyPolicy.classList.add('hidden');
      });
    }

    // Compliance Modals: Terms of Service
    if (el.btnOpenTermsService) {
      el.btnOpenTermsService.addEventListener('click', () => {
        if (el.modalTermsService) el.modalTermsService.classList.remove('hidden');
      });
    }
    if (el.btnCloseTermsService) {
      el.btnCloseTermsService.addEventListener('click', () => {
        if (el.modalTermsService) el.modalTermsService.classList.add('hidden');
      });
    }
    if (el.btnAcceptTerms) {
      el.btnAcceptTerms.addEventListener('click', () => {
        if (el.modalTermsService) el.modalTermsService.classList.add('hidden');
      });
    }

    // Compliance Modals: Monetag Settings
    if (el.btnOpenMonetagSettings) {
      el.btnOpenMonetagSettings.addEventListener('click', () => {
        if (el.modalMonetagSettings) el.modalMonetagSettings.classList.remove('hidden');
      });
    }
    if (el.btnCloseMonetagSettings) {
      el.btnCloseMonetagSettings.addEventListener('click', () => {
        if (el.modalMonetagSettings) el.modalMonetagSettings.classList.add('hidden');
      });
    }
    if (el.btnDoneMonetagSettings) {
      el.btnDoneMonetagSettings.addEventListener('click', () => {
        if (el.modalMonetagSettings) el.modalMonetagSettings.classList.add('hidden');
      });
    }

    // Save Monetag Settings Form
    if (el.formMonetagConfig) {
      el.formMonetagConfig.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('Settings saved.', 'info');
        if (el.modalMonetagSettings) el.modalMonetagSettings.classList.add('hidden');
      });
    }

    // Test Ad Button in Settings
    if (el.btnTestGameAd) {
      el.btnTestGameAd.addEventListener('click', () => {
        showNotification('Ads are disabled on this platform.', 'info');
      });
    }

    // Skip Ad Button click handler
    if (el.btnSkipGameAd) {
      el.btnSkipGameAd.addEventListener('click', () => {
        dismissGameInterstitial();
      });
    }
  }

  function showGameInterstitialAd(game, onComplete) {
    // Zero ads: instantly resolve
    if (el.gameInterstitialOverlay) {
      el.gameInterstitialOverlay.classList.add('hidden');
    }
    if (typeof onComplete === 'function') {
      onComplete();
    }
  }

  function dismissGameInterstitial() {
    if (interstitialTimer) {
      clearInterval(interstitialTimer);
      interstitialTimer = null;
    }
    if (el.gameInterstitialOverlay) {
      el.gameInterstitialOverlay.classList.add('hidden');
    }
    const cb = onInterstitialFinishedCallback;
    onInterstitialFinishedCallback = null;
    if (typeof cb === 'function') {
      cb();
    }
  }

  function loadGameIntoFrame(game) {
    if (!el.gamePlayerFrame || currentGameData !== game) return;

    // Construct 3, Flash / Ruffle, and directLoad games require standard HTTP origin
    if (game.id === 'tag' || game.id === 'douchebaglife' || game.isFlash || game.directLoad) {
      el.gamePlayerFrame.removeAttribute('srcdoc');
      el.gamePlayerFrame.src = game.url;
      return;
    }

    // gn-math architecture: Load game HTML via Blob URL with injected <base href> for original scripts
    if (game.url && (game.url.endsWith('.html') || game.url.includes('/games/') || game.url.startsWith('http'))) {
      const rootUrl = document.baseURI || (location.origin && location.origin !== 'null' ? location.origin : 'http://localhost:3000');
      let fetchTarget = game.url;
      let dirBase = game.url;
      try {
        const resolved = new URL(game.url, rootUrl).href;
        fetchTarget = resolved;
        dirBase = new URL('./', resolved).href;
      } catch (e) {}

      fetch(fetchTarget)
        .then(res => {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.text();
        })
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          // 1. Remove third-party ad containers and trackers
          doc.querySelectorAll('#sidebarad1, #sidebarad2, .ad-banner, .adsbygoogle, ins.adsbygoogle, [id*="ad-"], [class*="ad-container"]').forEach(e => e.remove());

          // 2. Remove tracking and analytics scripts that trigger school filter blocks
          doc.querySelectorAll('script').forEach(s => {
            const src = (s.getAttribute('src') || '').toLowerCase();
            const content = (s.textContent || '').toLowerCase();
            if (
              src.includes('google-analytics.com') ||
              src.includes('googletagmanager.com') ||
              src.includes('pagead2.googlesyndication.com') ||
              src.includes('doubleclick.net') ||
              src.includes('monetag.com') ||
              src.includes('adservice') ||
              src.includes('adnxs') ||
              src.includes('criteo') ||
              content.includes('google-analytics.com/analytics.js') ||
              content.includes('googletagmanager.com/gtag')
            ) {
              s.remove();
            }
          });

          // 3. Inject safe mock/stub APIs so games expecting analytics/SDKs run error-free
          const stubs = doc.createElement('script');
          stubs.textContent = `
            window.dataLayer = window.dataLayer || [];
            window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
            window.ga = window.ga || function(){};
            window.adsbygoogle = window.adsbygoogle || { push: function(){} };
            window.PokiSDK = window.PokiSDK || {
              init: () => Promise.resolve(),
              gameLoadingStart: () => {},
              gameLoadingFinished: () => {},
              gameplayStart: () => {},
              gameplayStop: () => {},
              commercialBreak: () => Promise.resolve(),
              rewardedBreak: () => Promise.resolve(true)
            };
            window.CrazyGames = window.CrazyGames || {
              SDK: {
                init: () => Promise.resolve(),
                requestAd: () => Promise.resolve(),
                gameplayStart: () => {},
                gameplayStop: () => {},
                happytime: () => {}
              }
            };
            window.GameAnalytics = window.GameAnalytics || {
              setEnabledInfoLog: () => {},
              initialize: () => {},
              addProgressionEvent: () => {}
            };
            window.gapi = window.gapi || { load: (n, cb) => { if (typeof cb === 'function') cb(); } };
          `;

          if (!doc.querySelector('base')) {
            const base = doc.createElement('base');
            base.href = dirBase;
            if (doc.head) {
              doc.head.insertBefore(base, doc.head.firstChild);
            } else {
              const h = doc.createElement('head');
              h.appendChild(base);
              doc.documentElement.insertBefore(h, doc.body || null);
            }
          }

          if (doc.head) {
            doc.head.appendChild(stubs);
          } else if (doc.documentElement) {
            doc.documentElement.appendChild(stubs);
          }
          const fullHtml = '<!doctype html>\n' + doc.documentElement.outerHTML;
          const blob = new Blob([fullHtml], { type: 'text/html' });
          const blobUrl = URL.createObjectURL(blob);
          el.gamePlayerFrame.removeAttribute('srcdoc');
          el.gamePlayerFrame.onload = () => {
            URL.revokeObjectURL(blobUrl);
          };
          el.gamePlayerFrame.src = blobUrl;
        })
        .catch(err => {
          console.warn('[Games] Blob execution fallback to direct URL:', err);
          el.gamePlayerFrame.removeAttribute('srcdoc');
          el.gamePlayerFrame.src = game.url;
        });
    } else {
      el.gamePlayerFrame.removeAttribute('srcdoc');
      el.gamePlayerFrame.src = game.url;
    }
  }

  function launchGame(game) {
    if (!game || !game.url) return;
    try {
      document.cookie = '__scramjet_active_origin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    } catch (e) {}

    // Open direct ad link whenever a game loads, EXCEPT for admins and users with the $5/monthly No-Ads Membership
    const isExemptFromAds = Boolean(
      state.user && (
        state.user.role === 'admin' ||
        isUserBokit() ||
        state.user.hasMembership === true
      )
    );
    if (!isExemptFromAds) {
      try {
        window.open('https://uplcm.com/4/11930399', '_blank', 'noopener,noreferrer');
      } catch (adErr) {}
    }

    currentGameData = game;

    if (el.gamePlayerTitle) {
      el.gamePlayerTitle.textContent = game.name || 'Game';
    }

    if (el.gamePlayerThumb) {
      if (game.coverUrl) {
        el.gamePlayerThumb.src = game.coverUrl;
        el.gamePlayerThumb.classList.remove('hidden');
      } else {
        el.gamePlayerThumb.classList.add('hidden');
      }
    }

    // Ensure ad overlay is kept hidden
    if (el.gameInterstitialOverlay) {
      el.gameInterstitialOverlay.classList.add('hidden');
    }

    if (el.gamesListView) el.gamesListView.classList.add('hidden');
    if (el.gamePlayerView) el.gamePlayerView.classList.remove('hidden');

    // Instantly launch game with zero ads or countdown delays
    loadGameIntoFrame(game);
  }

  function closeGamePlayer() {
    dismissGameInterstitial();
    currentGameData = null;

    // Reset iframe to stop audio and WebGL execution in the background
    if (el.gamePlayerFrame) {
      el.gamePlayerFrame.removeAttribute('src');
      el.gamePlayerFrame.srcdoc = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{background:#000;margin:0;}</style></head><body></body></html>';
    }

    if (el.gamePlayerThumb) {
      el.gamePlayerThumb.classList.add('hidden');
      el.gamePlayerThumb.src = '';
    }

    if (el.gamePlayerView) el.gamePlayerView.classList.add('hidden');
    if (el.gamesListView) el.gamesListView.classList.remove('hidden');
  }

  // ============================================================================
  // MOVIES STREAMING LIBRARY, SEARCH & THEATER PLAYER (AllFlix-style Experience)
  // ============================================================================
  let allCatalogMovies = [];
  let allLocalMovies = [];
  let activeGenreFilter = 'all';
  let activeTypeFilter = 'all';
  let activeYearFilter = 'all';
  let activeFeaturedMovie = null;
  let activeDetailMovie = null;
  let activeDetailSeason = 1;
  let activeDetailEpisode = 1;
  let currentDetailSources = [];
  let selectedDetailSourceIndex = 0;
  let currentPlaybackMovie = null;
  let currentPlaybackSources = [];
  let currentPlaybackSourceIndex = 0;
  let currentPlaybackSeason = null;
  let currentPlaybackEpisode = null;
  let movieSearchDebounceTimer = null;

  const MOVIES_PAGE_SIZE = 12;
  let moviesDisplayedLimit = MOVIES_PAGE_SIZE;
  let currentFilteredMovies = [];
  let moviesInfiniteObserver = null;
  let resumeToastTimer = null;
  let catalogCurrentPage = 1;
  let catalogTotalPages = 1;
  let catalogLoadingMore = false;
  let isCatalogSearching = false;

  const MOVIES_WATCHLIST_KEY = 'bokit_movies_watchlist';
  const MOVIES_HISTORY_KEY = 'bokit_movies_history';

  let movieWatchlist = [];
  try {
    const rawW = localStorage.getItem(MOVIES_WATCHLIST_KEY);
    movieWatchlist = rawW ? JSON.parse(rawW) : [];
  } catch (e) {
    movieWatchlist = [];
  }

  let movieHistory = [];
  try {
    const rawH = localStorage.getItem(MOVIES_HISTORY_KEY);
    movieHistory = rawH ? JSON.parse(rawH) : [];
  } catch (e) {
    movieHistory = [];
  }

  function formatTimeHMS(sec) {
    if (!sec || isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function showResumeToast(msg) {
    if (!el.moviePlayerResumeToast) return;
    if (el.movieResumeToastText) el.movieResumeToastText.textContent = msg;
    el.moviePlayerResumeToast.classList.remove('hidden');
    clearTimeout(resumeToastTimer);
    resumeToastTimer = setTimeout(() => {
      if (el.moviePlayerResumeToast) el.moviePlayerResumeToast.classList.add('hidden');
    }, 4500);
  }

  function isMovieInWatchlist(id) {
    if (!id) return false;
    return movieWatchlist.some(m => String(m.id) === String(id));
  }

  function saveMovieWatchlist() {
    try {
      localStorage.setItem(MOVIES_WATCHLIST_KEY, JSON.stringify(movieWatchlist));
    } catch (e) {}
    updateModalWatchlistButton();
    updateWatchlistPillCount();
    if (activeGenreFilter === 'watchlist') {
      applyMoviesFilter();
    }
  }

  function updateWatchlistPillCount() {
    const pill = el.moviesGenrePills?.querySelector('[data-category="watchlist"]');
    if (pill) {
      pill.textContent = `⭐ Watchlist (${movieWatchlist.length})`;
    }
  }

  function toggleMovieWatchlist(movie) {
    if (!movie || !movie.id) return;
    const idx = movieWatchlist.findIndex(m => String(m.id) === String(movie.id));
    if (idx >= 0) {
      movieWatchlist.splice(idx, 1);
    } else {
      movieWatchlist.unshift({
        id: movie.id,
        title: movie.title,
        year: movie.year,
        posterUrl: movie.posterUrl || movie.backdropUrl,
        rating: movie.rating || '8.5',
        genre: movie.genre || 'Cinema',
        format: movie.format || (movie.isLocal ? 'LOCAL' : 'HD'),
        type: movie.type || (movie.isSeries ? 'series' : 'movie'),
        isLocal: movie.isLocal || false,
        canDownload: movie.canDownload || false,
        downloadUrl: movie.downloadUrl || null
      });
    }
    saveMovieWatchlist();

    // Update bookmark icon state on cards in DOM
    document.querySelectorAll(`.movie-card-watchlist-btn[data-id="${movie.id}"]`).forEach(btn => {
      const active = isMovieInWatchlist(movie.id);
      btn.classList.toggle('active', active);
      const svg = btn.querySelector('svg');
      if (svg) svg.setAttribute('fill', active ? 'currentColor' : 'none');
    });
  }

  function updateModalWatchlistButton() {
    if (!el.btnModalWatchlist || !activeDetailMovie) return;
    const inWatchlist = isMovieInWatchlist(activeDetailMovie.id);
    el.btnModalWatchlist.classList.toggle('active', inWatchlist);
    if (el.modalWatchlistText) {
      el.modalWatchlistText.textContent = inWatchlist ? 'In Watchlist' : 'Watchlist';
    }
  }

  function saveMovieHistoryItem(movie, season = null, episode = null, progressPercent = 20, currentTime = 0, duration = 0) {
    if (!movie || !movie.id) return;
    const existingIdx = movieHistory.findIndex(h => String(h.id) === String(movie.id));
    const prev = existingIdx >= 0 ? movieHistory[existingIdx] : null;

    const item = {
      id: movie.id,
      title: movie.title || prev?.title || 'Movie',
      year: movie.year || prev?.year || '',
      posterUrl: movie.posterUrl || movie.backdropUrl || prev?.posterUrl,
      format: movie.format || prev?.format || (movie.isLocal ? 'LOCAL' : 'HD'),
      type: movie.type || prev?.type || (season ? 'series' : 'movie'),
      season: season !== null ? season : (prev?.season || null),
      episode: episode !== null ? episode : (prev?.episode || null),
      isLocal: movie.isLocal !== undefined ? movie.isLocal : (prev?.isLocal || false),
      timestamp: Date.now(),
      progressPercent: progressPercent !== undefined ? progressPercent : (prev?.progressPercent || 15),
      currentTime: currentTime || prev?.currentTime || 0,
      duration: duration || prev?.duration || 0
    };
    if (existingIdx >= 0) {
      movieHistory.splice(existingIdx, 1);
    }
    movieHistory.unshift(item);
    if (movieHistory.length > 20) movieHistory.pop();
    try {
      localStorage.setItem(MOVIES_HISTORY_KEY, JSON.stringify(movieHistory));
    } catch (e) {}
    renderContinueWatchingShelf();
  }

  function removeMovieHistoryItem(id, e) {
    if (e) e.stopPropagation();
    movieHistory = movieHistory.filter(h => String(h.id) !== String(id));
    try {
      localStorage.setItem(MOVIES_HISTORY_KEY, JSON.stringify(movieHistory));
    } catch (e) {}
    renderContinueWatchingShelf();
  }

  function clearAllMovieHistory() {
    movieHistory = [];
    try {
      localStorage.removeItem(MOVIES_HISTORY_KEY);
    } catch (e) {}
    renderContinueWatchingShelf();
  }

  function renderContinueWatchingShelf() {
    if (!el.moviesContinueWatchingSection || !el.moviesContinueWatchingGrid) return;
    if (movieHistory.length === 0 || activeGenreFilter === 'watchlist') {
      el.moviesContinueWatchingSection.classList.add('hidden');
      return;
    }

    el.moviesContinueWatchingSection.classList.remove('hidden');
    if (el.moviesContinueWatchingCount) {
      el.moviesContinueWatchingCount.textContent = movieHistory.length;
    }

    el.moviesContinueWatchingGrid.innerHTML = '';
    movieHistory.slice(0, 8).forEach(item => {
      const card = document.createElement('div');
      card.className = 'continue-card';
      let epText = item.season ? `S${item.season}:E${item.episode || 1}` : (item.year ? `${item.year}` : 'Movie');
      if (item.duration && item.currentTime) {
        const remainingMin = Math.max(1, Math.round((item.duration - item.currentTime) / 60));
        epText += ` • ${remainingMin}m left`;
      } else if (item.progressPercent) {
        epText += ` • ${item.progressPercent}%`;
      }
      const thumb = item.posterUrl || '';

      card.innerHTML = `
        <div class="continue-card-thumb-wrap">
          ${thumb ? `<img src="${escapeHtml(thumb)}" alt="${escapeHtml(item.title)}" class="continue-card-thumb" loading="lazy" />` : `<div class="movie-card-placeholder"><span class="movie-card-placeholder-icon">🎬</span></div>`}
          <button type="button" class="continue-card-remove" title="Remove from Continue Watching">&times;</button>
          <div class="continue-card-progress-bar" style="width: ${Math.max(8, Math.min(100, item.progressPercent || 25))}%;"></div>
          <div class="movie-card-hover-overlay">
            <div class="movie-play-btn-circle" style="width: 42px; height: 42px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </div>
          </div>
        </div>
        <div class="continue-card-info">
          <h4 class="continue-card-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h4>
          <span class="continue-card-sub">${escapeHtml(epText)}</span>
        </div>
      `;

      const removeBtn = card.querySelector('.continue-card-remove');
      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          removeMovieHistoryItem(item.id, e);
        });
      }

      card.addEventListener('click', () => {
        const found = allCatalogMovies.find(m => String(m.id) === String(item.id)) ||
                      allLocalMovies.find(m => String(m.id) === String(item.id)) ||
                      { id: item.id, title: item.title, year: item.year, posterUrl: item.posterUrl, isLocal: item.isLocal };
        launchMovie(found, 0, item.season, item.episode);
      });

      el.moviesContinueWatchingGrid.appendChild(card);
    });
  }

  const VERIFIED_TRAILERS = {
    'tt1375666': 'YoHD9XEInc0',
    'tt0816692': 'zSWdZVtXT7E',
    'tt0468569': 'EXeTwQWrcwY',
    'tt0133093': 'vKQi3bBA1y8',
    'tt15239678': 'Way9Dexny3w',
    'tt15398776': 'uYPbbksJxIg',
    'tt9362722': 'cqGjhVJWtEg',
    'tt0175142': '_dxqSg_iV70',
    'tt0903747': 'HhesaQXLuRY',
    'tt4574334': 'b9EkMc79ZSU'
  };

  function openTrailerModal(title, year, id = null, trailerId = null) {
    if (!el.movieTrailerModal || !el.movieTrailerFrame) return;
    const cleanTitle = (title || 'Movie').replace(/[\(\)]/g, '');
    const cleanYear = year || '';
    if (el.movieTrailerTitle) {
      el.movieTrailerTitle.textContent = `${cleanTitle} (${cleanYear}) — Official Trailer`;
    }

    const tId = trailerId || activeDetailMovie?.trailerKey || activeFeaturedMovie?.trailerKey || (id && VERIFIED_TRAILERS[id]) || (activeDetailMovie?.id && VERIFIED_TRAILERS[activeDetailMovie.id]) || (activeFeaturedMovie?.id && VERIFIED_TRAILERS[activeFeaturedMovie.id]);

    if (tId) {
      el.movieTrailerFrame.src = `https://www.youtube-nocookie.com/embed/${tId}?autoplay=1&rel=0`;
    } else {
      const query = encodeURIComponent(`${cleanTitle} ${cleanYear} official trailer`);
      el.movieTrailerFrame.src = `https://www.youtube-nocookie.com/embed?listType=search&list=${query}&autoplay=1`;
    }
    el.movieTrailerModal.classList.remove('hidden');
  }

  function closeTrailerModal() {
    if (!el.movieTrailerModal || !el.movieTrailerFrame) return;
    el.movieTrailerFrame.removeAttribute('src');
    el.movieTrailerModal.classList.add('hidden');
  }

  async function loadTvSeasonsAndEpisodes(id, totalSeasons = 1, currentSeason = 1) {
    if (!el.movieModalTvSection || !el.movieModalSeasonSelect || !el.movieModalEpisodesList) return;
    el.movieModalTvSection.classList.remove('hidden');

    el.movieModalSeasonSelect.innerHTML = '';
    const seasonsCount = Math.max(1, parseInt(totalSeasons, 10) || 1);
    for (let s = 1; s <= seasonsCount; s++) {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = `Season ${s}`;
      if (s === currentSeason) opt.selected = true;
      el.movieModalSeasonSelect.appendChild(opt);
    }

    activeDetailSeason = currentSeason;
    await fetchAndRenderEpisodes(id, currentSeason);
  }

  async function fetchAndRenderEpisodes(id, season) {
    if (!el.movieModalEpisodesList) return;
    el.movieModalEpisodesList.innerHTML = `<div style="grid-column: 1/-1; padding: 12px; color: #949ba4; font-size: 13px;">Loading Season ${season} episodes...</div>`;

    try {
      const res = await fetch(`/api/movies/episodes?id=${encodeURIComponent(id)}&season=${season}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const episodes = Array.isArray(data.episodes) && data.episodes.length > 0 ? data.episodes : [];

      el.movieModalEpisodesList.innerHTML = '';
      if (episodes.length === 0) {
        el.movieModalEpisodesList.innerHTML = `<div style="grid-column: 1/-1; padding: 12px; color: #949ba4; font-size: 13px;">No episode details listed for this season. Standard streaming remains available.</div>`;
        return;
      }

      episodes.forEach(ep => {
        const item = document.createElement('div');
        item.className = `movie-episode-item ${ep.episode === activeDetailEpisode ? 'active' : ''}`;
        const stillHtml = ep.stillUrl
          ? `<img src="${escapeHtml(ep.stillUrl)}" class="episode-still-img" alt="Episode ${ep.episode}" loading="lazy" />`
          : '';
        const overviewHtml = ep.overview
          ? `<p class="episode-item-overview" title="${escapeHtml(ep.overview)}">${escapeHtml(ep.overview)}</p>`
          : '';

        item.innerHTML = `
          ${stillHtml}
          <span class="episode-num-badge">EPISODE ${ep.episode}</span>
          <span class="episode-item-title" title="${escapeHtml(ep.title)}">${escapeHtml(ep.title)}</span>
          <div class="episode-item-meta">
            <span>⭐ ${escapeHtml(ep.rating || '8.0')}</span>
            ${ep.released ? `<span>•</span><span>${escapeHtml(ep.released)}</span>` : ''}
          </div>
          ${overviewHtml}
        `;

        item.addEventListener('click', () => {
          activeDetailEpisode = ep.episode;
          const allItems = el.movieModalEpisodesList.querySelectorAll('.movie-episode-item');
          allItems.forEach(i => i.classList.remove('active'));
          item.classList.add('active');

          if (el.modalWatchLabel) {
            el.modalWatchLabel.textContent = `Stream S${activeDetailSeason}:E${activeDetailEpisode}`;
          }

          if (activeDetailMovie) {
            launchMovie(activeDetailMovie, selectedDetailSourceIndex, activeDetailSeason, activeDetailEpisode);
          }
        });

        el.movieModalEpisodesList.appendChild(item);
      });
    } catch (err) {
      console.error('[Movies] Error fetching episodes:', err);
      el.movieModalEpisodesList.innerHTML = `<div style="grid-column: 1/-1; padding: 12px; color: #f04747; font-size: 13px;">Failed to load episode list. You can still stream directly using the stream button.</div>`;
    }
  }

  function renderMoviesSkeleton(container, count = 12) {
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const skel = document.createElement('div');
      skel.className = 'movie-skeleton-card';
      skel.innerHTML = `
        <div class="movie-skeleton-poster"></div>
        <div class="movie-skeleton-info">
          <div class="movie-skeleton-title"></div>
          <div class="movie-skeleton-meta"></div>
        </div>
      `;
      container.appendChild(skel);
    }
  }

  // Continue Watching Storage System
  let continueWatchingList = [];
  function loadContinueWatchingFromStorage() {
    try {
      const raw = localStorage.getItem('bokit_movies_continue_watching');
      continueWatchingList = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(continueWatchingList)) continueWatchingList = [];
    } catch (e) {
      continueWatchingList = [];
    }
  }

  function saveContinueWatchingToStorage() {
    try {
      localStorage.setItem('bokit_movies_continue_watching', JSON.stringify(continueWatchingList));
    } catch (e) {}
  }

  function updateContinueWatching(progressData) {
    if (!progressData || !progressData.id) return;
    const sId = String(progressData.id);

    // If near the end (>95% duration), remove from continue watching
    if (progressData.duration > 0 && (progressData.currentTime / progressData.duration) > 0.95) {
      continueWatchingList = continueWatchingList.filter(item => String(item.id) !== sId);
      saveContinueWatchingToStorage();
      renderContinueWatchingRow();
      return;
    }

    if (progressData.currentTime < 1) return;

    const existingIdx = continueWatchingList.findIndex(item => String(item.id) === sId);
    const itemData = {
      id: sId,
      title: progressData.title || (currentPlaybackMovie ? currentPlaybackMovie.title : 'Movie'),
      isTv: Boolean(progressData.isTv),
      season: progressData.season || null,
      episode: progressData.episode || null,
      posterUrl: (currentPlaybackMovie ? (currentPlaybackMovie.posterUrl || currentPlaybackMovie.poster) : null),
      backdropUrl: (currentPlaybackMovie ? (currentPlaybackMovie.backdropUrl || currentPlaybackMovie.backdrop) : null),
      progress: {
        currentTime: progressData.currentTime,
        duration: progressData.duration,
        timestamp: progressData.timestamp || Date.now()
      }
    };

    if (existingIdx !== -1) {
      continueWatchingList[existingIdx] = itemData;
    } else {
      continueWatchingList.unshift(itemData);
    }

    if (continueWatchingList.length > 20) {
      continueWatchingList = continueWatchingList.slice(0, 20);
    }

    saveContinueWatchingToStorage();
    renderContinueWatchingRow();
  }

  // Hero Spotlight Carousel State
  let heroFeaturedRotation = [];
  let heroFeaturedIndex = 0;
  let heroAutoRotateTimer = null;

  function createMovieCardElement(movie, index) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.setAttribute('data-id', movie.id);
    card.setAttribute('data-movie-id', movie.id);
    card.style.animationDelay = `${index * 20}ms`;

    const posterSrc = movie.posterUrl || movie.poster;
    const format = movie.quality || (movie.isLocal ? 'LOCAL' : (movie.type === 'series' ? 'TV HD' : 'HD'));
    const year = movie.year ? `${movie.year}` : '';
    const rating = movie.rating ? movie.rating : '8.0';
    const inWl = isMovieInWatchlist(movie.id);

    // Continue Watching Progress Bar & Resume Badge
    let progressHtml = '';
    let resumeBadge = '';
    if (movie.progress && movie.progress.duration > 0) {
      const pct = Math.min(100, Math.max(5, Math.round((movie.progress.currentTime / movie.progress.duration) * 100)));
      progressHtml = `
        <div class="movie-card-progress-bar">
          <div class="movie-card-progress-fill" style="width: ${pct}%;"></div>
        </div>
      `;
      resumeBadge = `<span class="movie-card-resume-badge">▶ RESUME</span>`;
    }

    const posterContent = posterSrc
      ? `<img src="${escapeHtml(posterSrc)}" alt="${escapeHtml(movie.title)}" loading="lazy" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='flex';" />
         <div class="movie-card-placeholder" style="display:none;">
           <span class="movie-card-placeholder-icon">🎬</span>
           <span class="movie-card-placeholder-title">${escapeHtml(movie.title)}</span>
         </div>`
      : `<div class="movie-card-placeholder">
           <span class="movie-card-placeholder-icon">🎬</span>
           <span class="movie-card-placeholder-title">${escapeHtml(movie.title)}</span>
         </div>`;

    card.innerHTML = `
      <div class="movie-card-poster">
        ${posterContent}
        <div class="movie-card-rating">
          <span>⭐</span>
          <span>${escapeHtml(String(rating).replace('⭐', '').trim())}</span>
        </div>
        ${resumeBadge}
        <span class="movie-card-badge">${escapeHtml(format)}</span>
        ${movie.canDownload ? `<span class="movie-card-downloadable-badge" title="Permits direct download">⬇ MP4</span>` : ''}
        ${progressHtml}
        <div class="movie-card-hover-overlay">
          <button type="button" class="btn-card-hover-play" title="Play Movie">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span>${movie.progress ? 'RESUME' : 'PLAY'}</span>
          </button>
          <button type="button" class="btn-card-hover-info" title="Movie Details">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>MORE INFO</span>
          </button>
          <button type="button" class="btn-card-hover-list ${inWl ? 'active' : ''}" title="${inWl ? 'Remove from My List' : 'Add to My List'}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="${inWl ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>${inWl ? '✓ IN LIST' : '+ MY LIST'}</span>
          </button>
        </div>
      </div>
      <div class="movie-card-info">
        <h3 class="movie-card-title" title="${escapeHtml(movie.title)}">${escapeHtml(movie.title)}</h3>
        <div class="movie-card-meta">
          ${year ? `<span>${escapeHtml(year)}</span>` : ''}
          ${movie.genre ? `<span>•</span><span>${escapeHtml(movie.genre.split(',')[0])}</span>` : ''}
        </div>
      </div>
    `;

    // Wire Hover buttons
    const playBtn = card.querySelector('.btn-card-hover-play');
    if (playBtn) {
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const startPos = (movie.progress && movie.progress.currentTime) ? movie.progress.currentTime : 0;
        launchMovie(movie, 0, movie.season || 1, movie.episode || 1, startPos);
      });
    }

    const infoBtn = card.querySelector('.btn-card-hover-info');
    if (infoBtn) {
      infoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openMovieDetailsModal(movie);
      });
    }

    const listBtn = card.querySelector('.btn-card-hover-list');
    if (listBtn) {
      listBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMovieWatchlist(movie);
        const nowInWl = isMovieInWatchlist(movie.id);
        listBtn.classList.toggle('active', nowInWl);
        listBtn.querySelector('span').textContent = nowInWl ? '✓ IN LIST' : '+ MY LIST';
      });
    }

    card.addEventListener('click', () => {
      openMovieDetailsModal(movie);
    });

    return card;
  }

  function appendMoviesToGrid(movies, container) {
    if (!container || !Array.isArray(movies)) return;
    movies.forEach((m, idx) => {
      container.appendChild(createMovieCardElement(m, idx));
    });
  }

  function renderMoviesGrid(movies, container) {
    if (!container) return;
    container.innerHTML = '';

    if (!Array.isArray(movies) || movies.length === 0) {
      if (el.moviesEmptyState && activeGenreFilter !== 'watchlist') {
        el.moviesEmptyState.classList.remove('hidden');
      }
      return;
    }

    if (el.moviesEmptyState) {
      el.moviesEmptyState.classList.add('hidden');
    }

    movies.forEach((movie, index) => {
      container.appendChild(createMovieCardElement(movie, index));
    });
  }

  function renderPaginatedGrid(moviesList, resetPaging = true) {
    if (resetPaging) {
      moviesDisplayedLimit = MOVIES_PAGE_SIZE;
    }
    currentFilteredMovies = Array.isArray(moviesList) ? moviesList : [];

    if (currentFilteredMovies.length === 0) {
      if (el.moviesGrid) el.moviesGrid.innerHTML = '';
      if (el.moviesEmptyState && activeGenreFilter !== 'watchlist') {
        el.moviesEmptyState.classList.remove('hidden');
      }
      if (el.btnMoviesLoadMore) el.btnMoviesLoadMore.classList.add('hidden');
      if (el.moviesCatalogEndHint) el.moviesCatalogEndHint.classList.add('hidden');
      return;
    }

    if (el.moviesEmptyState) {
      el.moviesEmptyState.classList.add('hidden');
    }

    const initialSlice = currentFilteredMovies.slice(0, moviesDisplayedLimit);
    renderMoviesGrid(initialSlice, el.moviesGrid);

    updatePaginationControls();
  }

  function updatePaginationControls() {
    if (!el.btnMoviesLoadMore) return;
    let hasMore = false;

    if (isCatalogSearching || activeGenreFilter === 'watchlist' || activeGenreFilter === 'local') {
      hasMore = currentFilteredMovies.length > moviesDisplayedLimit;
    } else {
      hasMore = catalogCurrentPage < catalogTotalPages;
    }

    el.btnMoviesLoadMore.classList.toggle('hidden', !hasMore);

    if (el.moviesCatalogEndHint) {
      const showEndHint = !hasMore && currentFilteredMovies.length >= 10;
      el.moviesCatalogEndHint.classList.toggle('hidden', !showEndHint);
    }
  }

  async function loadMoreMovies() {
    if (isCatalogSearching || activeGenreFilter === 'watchlist' || activeGenreFilter === 'local') {
      if (moviesDisplayedLimit >= currentFilteredMovies.length) return;
      const prevLimit = moviesDisplayedLimit;
      moviesDisplayedLimit = Math.min(currentFilteredMovies.length, moviesDisplayedLimit + MOVIES_PAGE_SIZE);
      const nextBatch = currentFilteredMovies.slice(prevLimit, moviesDisplayedLimit);
      appendMoviesToGrid(nextBatch, el.moviesGrid);
      updatePaginationControls();
      return;
    }

    if (catalogLoadingMore || catalogCurrentPage >= catalogTotalPages) return;
    catalogLoadingMore = true;

    if (el.btnMoviesLoadMore) {
      el.btnMoviesLoadMore.innerHTML = `<span>Loading More Titles...</span>`;
    }

    try {
      const nextPage = catalogCurrentPage + 1;
      const typeParam = activeTypeFilter !== 'all' ? `&type=${encodeURIComponent(activeTypeFilter)}` : '';
      const yearParam = (activeYearFilter && activeYearFilter !== 'all') ? `&year=${encodeURIComponent(activeYearFilter)}` : '';
      const res = await fetch(`/api/movies/catalog?page=${nextPage}&category=${encodeURIComponent(activeGenreFilter)}&limit=20${typeParam}${yearParam}`);

      if (res.ok) {
        const data = await res.json();
        const nextItems = Array.isArray(data.items) ? data.items : (Array.isArray(data.results) ? data.results : []);
        if (nextItems.length > 0) {
          catalogCurrentPage = nextPage;
          catalogTotalPages = data.totalPages || data.total_pages || catalogTotalPages;
          currentFilteredMovies = currentFilteredMovies.concat(nextItems);
          appendMoviesToGrid(nextItems, el.moviesGrid);
        } else {
          catalogTotalPages = catalogCurrentPage;
        }
      }
    } catch (e) {
      console.warn('[Movies] Failed loading more catalog titles:', e);
    } finally {
      catalogLoadingMore = false;
      if (el.btnMoviesLoadMore) {
        el.btnMoviesLoadMore.innerHTML = `
          <span>Load More Titles</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        `;
      }
      updatePaginationControls();
    }
  }

  // AllFlix Homepage Loader
  let homepageDataCache = null;

  async function loadMoviesList() {
    loadContinueWatchingFromStorage();
    if (el.moviesGrid) renderMoviesSkeleton(el.moviesGrid, 12);

    try {
      const res = await fetch('/api/movies/homepage');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      homepageDataCache = data;

      // Extract rotation list and active hero movie
      heroFeaturedRotation = (data.featuredRotation && data.featuredRotation.length > 0)
        ? data.featuredRotation
        : (data.hero ? [data.hero] : []);
      activeFeaturedMovie = heroFeaturedRotation[0] || data.hero || null;

      // Setup Hero Spotlight Carousel
      setupHeroCarousel(heroFeaturedRotation);

      // Render AllFlix Horizontal Rows
      renderAllFlixRows(data);

      // Render Category Navigation Pills
      const categories = [
        { id: 'all', label: 'All Cinema' },
        { id: 'trending-movies', label: '🔥 Trending' },
        { id: 'popular-movies', label: '🌟 Popular' },
        { id: 'top-rated-movies', label: '🏆 Top Rated' },
        { id: 'now-playing', label: '🍿 In Theaters' },
        { id: 'upcoming', label: '📅 Upcoming' },
        { id: 'my-list', label: `⭐ My List (${movieWatchlist.length})` },
        { id: 'continue-watching', label: `🕒 Continue Watching (${continueWatchingList.length})` },
        { id: 'genre-action', label: '💥 Action' },
        { id: 'genre-adventure', label: '🗺️ Adventure' },
        { id: 'genre-comedy', label: '😂 Comedy' },
        { id: 'genre-horror', label: '😱 Horror' },
        { id: 'genre-scifi', label: '🚀 Sci-Fi' },
        { id: 'trending-tv', label: '📺 TV Shows' }
      ];
      renderGenrePills(categories);

      // Check URL route
      handleMovieHashRoute();
    } catch (err) {
      console.error('[Movies] Error loading AllFlix homepage:', err);
    }
  }

  function setupHeroCarousel(rotationList) {
    if (!rotationList || rotationList.length === 0) return;
    heroFeaturedIndex = 0;
    renderHeroBanner(rotationList[0], 0);

    // Setup dots
    if (el.moviesHeroDots) {
      el.moviesHeroDots.innerHTML = '';
      rotationList.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.className = `hero-carousel-dot ${idx === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => {
          heroFeaturedIndex = idx;
          renderHeroBanner(rotationList[idx], idx);
          restartHeroAutoRotate();
        });
        el.moviesHeroDots.appendChild(dot);
      });
    }

    // Prev / Next button listeners
    if (el.btnHeroPrev) {
      el.btnHeroPrev.onclick = () => {
        heroFeaturedIndex = (heroFeaturedIndex - 1 + rotationList.length) % rotationList.length;
        renderHeroBanner(rotationList[heroFeaturedIndex], heroFeaturedIndex);
        restartHeroAutoRotate();
      };
    }

    if (el.btnHeroNext) {
      el.btnHeroNext.onclick = () => {
        heroFeaturedIndex = (heroFeaturedIndex + 1) % rotationList.length;
        renderHeroBanner(rotationList[heroFeaturedIndex], heroFeaturedIndex);
        restartHeroAutoRotate();
      };
    }

    restartHeroAutoRotate();
  }

  function restartHeroAutoRotate() {
    if (heroAutoRotateTimer) clearInterval(heroAutoRotateTimer);
    if (heroFeaturedRotation.length <= 1) return;

    heroAutoRotateTimer = setInterval(() => {
      heroFeaturedIndex = (heroFeaturedIndex + 1) % heroFeaturedRotation.length;
      renderHeroBanner(heroFeaturedRotation[heroFeaturedIndex], heroFeaturedIndex);
    }, 9000); // Rotate every 9 seconds
  }

  function renderHeroBanner(movie, index = 0) {
    if (!el.moviesHeroBanner || !movie) return;
    activeFeaturedMovie = movie;

    if (el.moviesHeroBackdrop) {
      const bg = movie.backdropUrl || movie.backdrop || movie.posterUrl || movie.poster || '';
      el.moviesHeroBackdrop.style.backgroundImage = bg ? `url('${bg}')` : 'none';
    }

    if (el.moviesHeroPosterImg) {
      const poster = movie.posterUrl || movie.poster || '';
      el.moviesHeroPosterImg.src = poster;
      el.moviesHeroPosterImg.style.display = poster ? 'block' : 'none';
    }

    if (el.moviesHeroTitle) {
      el.moviesHeroTitle.textContent = movie.title || 'Featured Blockbuster';
    }
    if (el.moviesHeroYear) {
      el.moviesHeroYear.textContent = movie.year || '';
    }
    if (el.moviesHeroRating) {
      el.moviesHeroRating.textContent = `⭐ ${movie.rating || '8.5'}`;
    }
    if (el.moviesHeroRuntime) {
      el.moviesHeroRuntime.textContent = movie.runtime || 'HD';
    }
    if (el.moviesHeroGenre) {
      el.moviesHeroGenre.textContent = movie.genre || 'Cinema';
    }
    if (el.moviesHeroDesc) {
      el.moviesHeroDesc.textContent = movie.plot || movie.overview || movie.description || 'Watch now in high definition.';
    }

    // Update dots indicator
    if (el.moviesHeroDots) {
      const dots = el.moviesHeroDots.querySelectorAll('.hero-carousel-dot');
      dots.forEach((d, idx) => d.classList.toggle('active', idx === index));
    }

    // Hero Action Buttons
    if (el.btnHeroWatch) {
      el.btnHeroWatch.onclick = () => {
        launchMovie(movie);
      };
    }
    if (el.btnHeroDetails) {
      el.btnHeroDetails.onclick = () => {
        openMovieDetailsModal(movie);
      };
    }
    if (el.btnHeroWatchlist) {
      const inWl = isMovieInWatchlist(movie.id);
      if (el.heroWatchlistText) el.heroWatchlistText.textContent = inWl ? '✓ IN LIST' : '+ MY LIST';
      el.btnHeroWatchlist.onclick = () => {
        toggleMovieWatchlist(movie);
        const nowInWl = isMovieInWatchlist(movie.id);
        if (el.heroWatchlistText) el.heroWatchlistText.textContent = nowInWl ? '✓ IN LIST' : '+ MY LIST';
      };
    }
    if (el.btnHeroTrailer) {
      el.btnHeroTrailer.onclick = () => {
        openTrailerModal(movie.title, movie.year, movie.id, movie.trailerKey);
      };
    }
  }

  // Render AllFlix Horizontal Rows
  function renderAllFlixRows(homepageData) {
    if (!el.moviesHomeRows) return;
    el.moviesHomeRows.innerHTML = '';

    // Switch to rows view
    if (el.moviesGridSection) el.moviesGridSection.classList.add('hidden');
    el.moviesHomeRows.classList.remove('hidden');

    // 1. Continue Watching Row (if exists)
    renderContinueWatchingRow();

    // 2. My List Row (if exists)
    renderMyListRow();

    // 3. Catalog Rows from API
    if (homepageData && Array.isArray(homepageData.rows)) {
      homepageData.rows.forEach(row => {
        if (!row.items || row.items.length === 0) return;
        const rowEl = createMovieRowElement(row);
        el.moviesHomeRows.appendChild(rowEl);
      });
    }
  }

  function renderContinueWatchingRow() {
    if (!el.moviesHomeRows) return;
    const existingRow = document.getElementById('row-continue-watching');
    if (existingRow) existingRow.remove();

    if (!continueWatchingList || continueWatchingList.length === 0) return;

    const rowObj = {
      id: 'continue-watching',
      title: 'Continue Watching',
      icon: '🕒',
      items: continueWatchingList
    };

    const rowEl = createMovieRowElement(rowObj, true);
    el.moviesHomeRows.prepend(rowEl);
  }

  function renderMyListRow() {
    if (!el.moviesHomeRows) return;
    const existingRow = document.getElementById('row-my-list');
    if (existingRow) existingRow.remove();

    if (!movieWatchlist || movieWatchlist.length === 0) return;

    const rowObj = {
      id: 'my-list',
      title: 'My Saved List',
      icon: '⭐',
      items: movieWatchlist
    };

    const rowEl = createMovieRowElement(rowObj);
    // Insert after continue watching or at top
    const cwRow = document.getElementById('row-continue-watching');
    if (cwRow && cwRow.nextSibling) {
      el.moviesHomeRows.insertBefore(rowEl, cwRow.nextSibling);
    } else {
      el.moviesHomeRows.prepend(rowEl);
    }
  }

  function createMovieRowElement(row, isContinueWatching = false) {
    const rowEl = document.createElement('div');
    rowEl.className = 'movies-row';
    rowEl.id = `row-${row.id}`;

    rowEl.innerHTML = `
      <div class="movies-row-header">
        <div class="movies-row-title-wrap">
          <span class="movies-row-icon">${row.icon || '🎬'}</span>
          <h3 class="movies-row-title">${escapeHtml(row.title)}</h3>
          <span class="movies-row-count">${row.items.length} Titles</span>
        </div>
        <div class="movies-row-actions">
          <button type="button" class="btn-row-nav prev" title="Scroll Left">&lsaquo;</button>
          <button type="button" class="btn-row-nav next" title="Scroll Right">&rsaquo;</button>
          <button type="button" class="btn-row-view-all" title="View All in Grid">VIEW ALL</button>
        </div>
      </div>
      <div class="movies-row-track custom-scrollbar"></div>
    `;

    const track = rowEl.querySelector('.movies-row-track');
    row.items.forEach((movie, idx) => {
      track.appendChild(createMovieCardElement(movie, idx));
    });

    const prevBtn = rowEl.querySelector('.btn-row-nav.prev');
    const nextBtn = rowEl.querySelector('.btn-row-nav.next');
    const viewAllBtn = rowEl.querySelector('.btn-row-view-all');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -600, behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        track.scrollBy({ left: 600, behavior: 'smooth' });
      });
    }

    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', () => {
        showGridViewForCategory(row.title, row.items, row.id);
      });
    }

    return rowEl;
  }

  function showGridViewForCategory(title, items, categoryId = '') {
    if (!el.moviesHomeRows || !el.moviesGridSection) return;

    el.moviesHomeRows.classList.add('hidden');
    el.moviesGridSection.classList.remove('hidden');

    if (el.moviesCatalogTitle) {
      el.moviesCatalogTitle.textContent = title;
    }
    if (el.moviesCatalogCount) {
      el.moviesCatalogCount.textContent = `${items.length} Titles`;
    }

    renderPaginatedGrid(items, true);

    if (el.btnBackToRows) {
      el.btnBackToRows.onclick = () => {
        el.moviesGridSection.classList.add('hidden');
        el.moviesHomeRows.classList.remove('hidden');
        if (el.moviesHeroBanner) el.moviesHeroBanner.classList.remove('hidden');
      };
    }
  }

  function renderGenrePills(categories) {
    if (!el.moviesGenrePills) return;
    el.moviesGenrePills.innerHTML = '';

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `movies-genre-pill ${activeGenreFilter === cat.id ? 'active' : ''}`;
      btn.setAttribute('data-category', cat.id);
      btn.textContent = cat.label;

      btn.addEventListener('click', () => {
        activeGenreFilter = cat.id;
        const allPills = el.moviesGenrePills.querySelectorAll('.movies-genre-pill');
        allPills.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');

        if (el.moviesSearchInput && el.moviesSearchInput.value.trim()) {
          el.moviesSearchInput.value = '';
          if (el.btnClearMoviesSearch) el.btnClearMoviesSearch.classList.add('hidden');
        }

        if (cat.id === 'all') {
          if (el.moviesGridSection) el.moviesGridSection.classList.add('hidden');
          if (el.moviesHomeRows) el.moviesHomeRows.classList.remove('hidden');
          if (el.moviesHeroBanner) el.moviesHeroBanner.classList.remove('hidden');
        } else if (cat.id === 'my-list') {
          showGridViewForCategory('⭐ My Saved List', movieWatchlist, 'my-list');
        } else if (cat.id === 'continue-watching') {
          showGridViewForCategory('🕒 Continue Watching', continueWatchingList, 'continue-watching');
        } else if (homepageDataCache && Array.isArray(homepageDataCache.rows)) {
          const matchedRow = homepageDataCache.rows.find(r => r.id === cat.id);
          if (matchedRow) {
            showGridViewForCategory(matchedRow.title, matchedRow.items, matchedRow.id);
          } else {
            fetchCatalogCategory(cat.id, 1);
          }
        }
      });

      el.moviesGenrePills.appendChild(btn);
    });
  }

  function renderContinueWatchingShelf() {
    renderContinueWatchingRow();
  }

  function renderLocalShelf() {
    // Handled seamlessly by AllFlix rows
  }

  async function fetchCatalogCategory(category = 'all', page = 1) {
    if (!el.moviesGrid) return;
    isCatalogSearching = false;
    catalogCurrentPage = page;

    if (el.moviesHomeRows) el.moviesHomeRows.classList.add('hidden');
    if (el.moviesGridSection) el.moviesGridSection.classList.remove('hidden');

    renderMoviesSkeleton(el.moviesGrid, 12);

    try {
      const typeParam = activeTypeFilter !== 'all' ? `&type=${encodeURIComponent(activeTypeFilter)}` : '';
      const yearParam = (activeYearFilter && activeYearFilter !== 'all') ? `&year=${encodeURIComponent(activeYearFilter)}` : '';
      const res = await fetch(`/api/movies/catalog?page=${page}&category=${encodeURIComponent(category)}&limit=20${typeParam}${yearParam}`);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      catalogTotalPages = data.totalPages || data.total_pages || 1;
      const items = Array.isArray(data.items) ? data.items : (Array.isArray(data.movies) ? data.movies : []);
      currentFilteredMovies = items;

      if (el.moviesCatalogCount) {
        el.moviesCatalogCount.textContent = `${items.length} Titles`;
      }

      renderPaginatedGrid(items, true);
    } catch (err) {
      console.error('[Movies] Error fetching catalog category:', err);
    }
  }

  function applyMoviesFilter() {
    const query = el.moviesSearchInput ? el.moviesSearchInput.value.trim() : '';
    if (query) {
      performMovieSearch(query);
      return;
    }

    if (el.moviesGridSection) el.moviesGridSection.classList.add('hidden');
    if (el.moviesHomeRows) el.moviesHomeRows.classList.remove('hidden');
    if (el.moviesHeroBanner) el.moviesHeroBanner.classList.remove('hidden');
  }

  async function performMovieSearch(query) {
    if (!el.moviesGrid) return;
    isCatalogSearching = true;

    if (el.moviesHeroBanner) el.moviesHeroBanner.classList.add('hidden');
    if (el.moviesHomeRows) el.moviesHomeRows.classList.add('hidden');
    if (el.moviesGridSection) el.moviesGridSection.classList.remove('hidden');

    renderMoviesSkeleton(el.moviesGrid, 8);

    if (el.moviesCatalogTitle) {
      el.moviesCatalogTitle.textContent = `Search results for "${query}"`;
    }
    if (el.moviesCatalogCount) {
      el.moviesCatalogCount.textContent = 'Searching...';
    }

    try {
      const typeParam = activeTypeFilter !== 'all' ? `&type=${encodeURIComponent(activeTypeFilter)}` : '';
      const yearParam = (activeYearFilter && activeYearFilter !== 'all') ? `&year=${encodeURIComponent(activeYearFilter)}` : '';
      const res = await fetch(`/api/movies/search?q=${encodeURIComponent(query)}${typeParam}${yearParam}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      let list = Array.isArray(data) ? data : (Array.isArray(data.results) ? data.results : []);

      if (el.moviesCatalogCount) {
        el.moviesCatalogCount.textContent = `${list.length} Found`;
      }

      renderPaginatedGrid(list, true);
    } catch (err) {
      console.error('[Movies] Search failed:', err);
    }
  }

  async function openMovieDetailsModal(movie) {
    if (!el.movieDetailsModal || !movie) return;
    activeDetailMovie = movie;
    selectedDetailSourceIndex = 0;
    const isInitialSeries = (movie.type === 'series' || movie.category === 'series' || Boolean(movie.totalSeasons && movie.totalSeasons > 0)) && !movie.isLocal && !String(movie.id).startsWith('local-');
    activeDetailSeason = isInitialSeries ? 1 : null;
    activeDetailEpisode = isInitialSeries ? 1 : null;

    // Reset modal fields with initial data
    if (el.movieModalTitle) el.movieModalTitle.textContent = movie.title || 'Movie';
    if (el.movieModalYear) el.movieModalYear.textContent = movie.year || '';
    if (el.movieModalRated) el.movieModalRated.textContent = movie.rated || 'HD';
    if (el.movieModalRuntime) el.movieModalRuntime.textContent = movie.runtime || movie.size || 'HD Stream';
    if (el.movieModalGenres) el.movieModalGenres.textContent = movie.genre || 'Cinema';
    if (el.movieModalRatingBadge) el.movieModalRatingBadge.textContent = `⭐ ${movie.rating || '8.5'}`;
    if (el.movieModalPlot) el.movieModalPlot.textContent = movie.plot || movie.description || 'Loading movie details...';
    if (el.movieModalDirector) el.movieModalDirector.textContent = movie.director || 'N/A';
    if (el.movieModalActors) el.movieModalActors.textContent = movie.actors || 'N/A';
    if (el.modalWatchLabel) el.modalWatchLabel.textContent = isInitialSeries ? 'Stream S1:E1' : 'Stream Movie';

    updateModalWatchlistButton();

    if (el.movieModalPosterImg) {
      el.movieModalPosterImg.src = movie.posterUrl || '';
      el.movieModalPosterImg.style.display = movie.posterUrl ? 'block' : 'none';
    }
    if (el.movieModalBackdropImg) {
      const bg = movie.backdropUrl || movie.posterUrl || '';
      el.movieModalBackdropImg.style.backgroundImage = bg ? `url('${bg}')` : 'none';
    }

    // Hide TV section initially until details confirmed
    if (el.movieModalTvSection) el.movieModalTvSection.classList.add('hidden');

    el.movieDetailsModal.classList.remove('hidden');

    // Update URL hash for clean navigation
    if (window.location.hash !== `#movies/detail/${movie.id}`) {
      history.pushState({ view: 'movie-detail', id: movie.id }, '', `#movies/detail/${movie.id}`);
    }

    // Fetch full details and sources
    try {
      const typeParam = (movie.type || movie.category) ? `&type=${encodeURIComponent(movie.type || movie.category)}` : '';
      const seasonParam = isInitialSeries ? '&s=1&e=1' : '';
      const res = await fetch(`/api/movies/detail?id=${encodeURIComponent(movie.id)}${typeParam}${seasonParam}`);
      if (res.ok) {
        const detail = await res.json();
        if (isInitialSeries && detail.type !== 'series') {
          detail.type = 'series';
          detail.category = 'series';
        }
        activeDetailMovie = { ...movie, ...detail };

        if (el.movieModalTitle) el.movieModalTitle.textContent = detail.title || movie.title;
        if (el.movieModalYear) el.movieModalYear.textContent = detail.year || movie.year;
        if (el.movieModalRated) el.movieModalRated.textContent = detail.rated || 'PG-13';
        if (el.movieModalRuntime) el.movieModalRuntime.textContent = detail.runtime || '120 min';
        if (el.movieModalGenres) el.movieModalGenres.textContent = detail.genre || movie.genre;
        if (el.movieModalPlot) el.movieModalPlot.textContent = detail.plot || 'No synopsis available.';
        if (el.movieModalDirector) el.movieModalDirector.textContent = detail.director || 'N/A';
        if (el.movieModalActors) el.movieModalActors.textContent = detail.actors || 'N/A';
        if (detail.posterUrl && el.movieModalPosterImg) {
          el.movieModalPosterImg.src = detail.posterUrl;
          el.movieModalPosterImg.style.display = 'block';
        }
        if (detail.backdropUrl && el.movieModalBackdropImg) {
          el.movieModalBackdropImg.style.backgroundImage = `url('${detail.backdropUrl}')`;
        }

        // TV series seasons check - strictly for genuine TV shows, never for movies or local files
        const isSeries = (detail.type === 'series' || movie.type === 'series' || Boolean(detail.totalSeasons && detail.totalSeasons > 0)) && !detail.isLocal && !movie.isLocal && !String(detail.id).startsWith('local-');
        if (isSeries && el.movieModalTvSection) {
          activeDetailSeason = 1;
          activeDetailEpisode = 1;
          loadTvSeasonsAndEpisodes(detail.id, detail.totalSeasons || 1, 1);
          if (el.modalWatchLabel) el.modalWatchLabel.textContent = 'Stream S1:E1';
        } else {
          activeDetailSeason = null;
          activeDetailEpisode = null;
          if (el.movieModalTvSection) el.movieModalTvSection.classList.add('hidden');
          if (el.modalWatchLabel) el.modalWatchLabel.textContent = 'Stream Movie';
        }

        // Populate server list for modal
        try {
          const provRes = await fetch(`/api/movies/sources?id=${encodeURIComponent(detail.id)}`);
          if (provRes.ok) {
            const provData = await provRes.json();
            currentDetailSources = provData.availableServers || provData.sources || [];
          } else {
            currentDetailSources = [];
          }
        } catch (e) {
          currentDetailSources = [];
        }

        // Populate Similar Movies Carousel
        if (el.movieModalSimilarSection && el.movieModalSimilarList) {
          if (Array.isArray(detail.similar) && detail.similar.length > 0) {
            el.movieModalSimilarList.innerHTML = '';
            detail.similar.forEach((sim, idx) => {
              const card = createMovieCardElement(sim, idx);
              el.movieModalSimilarList.appendChild(card);
            });
            el.movieModalSimilarSection.classList.remove('hidden');
          } else {
            el.movieModalSimilarSection.classList.add('hidden');
          }
        }

        renderModalServerPills(currentDetailSources);
        updateModalDownloadButton();
      }
    } catch (err) {
      console.error('[Movies] Detail fetch error:', err);
    }
  }

  function renderModalServerPills(sources) {
    if (!el.movieModalServersList) return;
    el.movieModalServersList.innerHTML = '';

    if (!Array.isArray(sources) || sources.length === 0) {
      el.movieModalServersList.innerHTML = `<span style="font-size:12px;color:#ed4245;background:rgba(237,66,69,0.12);padding:4px 8px;border-radius:4px;border:1px solid rgba(237,66,69,0.3);">⚠️ Native Stream Unavailable (Watch Trailer)</span>`;
      return;
    }

    sources.forEach((src, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `movie-server-btn ${idx === selectedDetailSourceIndex ? 'active' : ''}`;
      const label = src.serverLabel || src.friendlyName || src.name || `Server ${idx + 1}`;
      btn.innerHTML = `
        <span>${escapeHtml(label)}</span>
        <span class="movie-server-badge">${escapeHtml(src.badge || src.quality || (src.canDownload ? 'Direct' : 'HLS'))}</span>
      `;

      btn.addEventListener('click', () => {
        selectedDetailSourceIndex = idx;
        const allBtns = el.movieModalServersList.querySelectorAll('.movie-server-btn');
        allBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateModalDownloadButton();
      });

      el.movieModalServersList.appendChild(btn);
    });
  }

  function updateModalDownloadButton() {
    const activeSource = currentDetailSources[selectedDetailSourceIndex];

    // Download button ONLY visible/active when the selected source explicitly permits downloading!
    if (activeSource && activeSource.canDownload && activeSource.downloadUrl) {
      if (el.btnModalDownload) {
        el.btnModalDownload.classList.remove('hidden');
        el.btnModalDownload.href = activeSource.downloadUrl;
        el.btnModalDownload.setAttribute('download', `${activeDetailMovie?.title || 'Movie'}.mp4`);
      }
      if (el.modalDownloadLabel) {
        el.modalDownloadLabel.textContent = `Download Movie (${activeSource.badge || 'Direct'})`;
      }
      if (el.modalDownloadNotice) {
        el.modalDownloadNotice.classList.add('hidden');
      }
    } else {
      if (el.btnModalDownload) {
        el.btnModalDownload.classList.add('hidden');
        el.btnModalDownload.removeAttribute('href');
      }
      if (el.modalDownloadNotice) {
        el.modalDownloadNotice.classList.remove('hidden');
      }
    }
  }

  function closeMovieDetailsModal() {
    if (el.movieDetailsModal) {
      el.movieDetailsModal.classList.add('hidden');
    }
    if (el.movieModalSimilarSection) {
      el.movieModalSimilarSection.classList.add('hidden');
    }
    if (el.movieModalSimilarList) {
      el.movieModalSimilarList.innerHTML = '';
    }
    activeDetailMovie = null;

    if (window.location.hash.startsWith('#movies/detail')) {
      history.pushState({ view: 'movies-library' }, '', '#movies');
    }
  }

  function showUnsupportedMovieOverlay(movie, fetchedData = null, season = null, isTvShow = false, episode = null) {
    currentPlaybackSources = [];
    closeMovieDetailsModal();
    if (el.moviesListView) el.moviesListView.classList.add('hidden');
    if (el.moviePlayerView) el.moviePlayerView.classList.remove('hidden');
    if (el.movieVideoElement) {
      el.movieVideoElement.pause();
      el.movieVideoElement.removeAttribute('src');
      el.movieVideoElement.load();
    }

    const resolvedTitle = (movie && movie.title && movie.title !== 'Streaming Title' && movie.title !== 'Movie')
      ? movie.title
      : (fetchedData?.title || 'This Title');
    const resolvedYear = (movie && movie.year) ? movie.year : (fetchedData?.year || '');
    const trailerKey = fetchedData?.trailerKey || movie?.trailerKey || movie?.trailerId || null;

    if (el.moviePlayerTitle) {
      let titleText = resolvedTitle;
      if (season && isTvShow) titleText += ` — S${season}:E${episode || 1}`;
      el.moviePlayerTitle.textContent = titleText;
    }
    if (el.moviePlayerYear) {
      el.moviePlayerYear.textContent = resolvedYear ? `(${resolvedYear})` : '';
    }
    if (el.moviePlayerBadge) {
      el.moviePlayerBadge.textContent = 'UNAVAILABLE';
    }
    if (el.moviePlayerSize) {
      el.moviePlayerSize.textContent = 'No Stream';
    }
    if (el.moviePlayerTvControls) {
      el.moviePlayerTvControls.classList.add('hidden');
    }
    if (el.moviePlayerServerSelect) {
      el.moviePlayerServerSelect.innerHTML = '<option value="">No Servers Available</option>';
    }
    if (el.moviePlayerSourcesList) {
      el.moviePlayerSourcesList.innerHTML = '<div class="movie-no-sources-notice" style="color:#94a3b8; font-size:13px; padding:6px 0;">⚠️ No authorized browser-playable stream is available for this title.</div>';
    }

    if (el.moviePlayerErrorOverlay) {
      el.moviePlayerErrorOverlay.classList.remove('hidden');
      if (el.movieErrorTitle) el.movieErrorTitle.textContent = 'Stream Unavailable for this Title';
      if (el.movieErrorDesc) {
        el.movieErrorDesc.textContent = `No authorized browser-playable stream is available for "${resolvedTitle}". Third-party embed webpages have been disabled to ensure native, ad-free HTML5 playback.`;
      }
      if (el.btnMovieErrorSwitch) {
        el.btnMovieErrorSwitch.innerHTML = '<span>← Browse Playable Titles</span>';
        el.btnMovieErrorSwitch.classList.remove('hidden');
        el.btnMovieErrorSwitch.onclick = () => {
          closeMoviePlayer();
          fetchCatalogCategory('local', 1);
        };
      }
      if (el.btnMovieErrorTrailer) {
        if (trailerKey || resolvedTitle) {
          el.btnMovieErrorTrailer.classList.remove('hidden');
          el.btnMovieErrorTrailer.onclick = () => {
            openTrailerModal(resolvedTitle, resolvedYear, movie?.id, trailerKey);
          };
        } else {
          el.btnMovieErrorTrailer.classList.add('hidden');
        }
      }
      if (el.btnMovieErrorDownload) {
        el.btnMovieErrorDownload.classList.add('hidden');
      }
    }
  }

  async function launchMovie(movie, sourceIndex = 0, season = null, episode = null) {
    if (!movie) return;

    // Strict detection: ONLY genuine TV series can have seasons and episodes
    const isTvShow = (movie.type === 'series' || movie.category === 'series' || Boolean(movie.totalSeasons && movie.totalSeasons > 0)) && !movie.isLocal && !String(movie.id).startsWith('local-');
    if (isTvShow) {
      season = Math.max(1, parseInt(season, 10) || 1);
      episode = Math.max(1, parseInt(episode, 10) || 1);
    } else {
      season = null;
      episode = null;
    }

    currentPlaybackMovie = movie;
    currentPlaybackSeason = season;
    currentPlaybackEpisode = episode;

    // Save to Continue Watching history
    saveMovieHistoryItem(movie, season, episode, 15);

    // Update Player View Header
    if (el.moviePlayerTitle) {
      let titleText = movie.title || 'Movie';
      if (season && isTvShow) titleText += ` — S${season}:E${episode || 1}`;
      el.moviePlayerTitle.textContent = titleText;
    }
    if (el.moviePlayerYear) {
      el.moviePlayerYear.textContent = movie.year ? `(${movie.year})` : '';
    }
    if (el.moviePlayerBadge) {
      el.moviePlayerBadge.textContent = movie.format || (isTvShow ? 'TV HD' : 'HD');
    }
    if (el.moviePlayerSize) {
      el.moviePlayerSize.textContent = movie.size || (movie.isLocal ? 'Local Stream' : 'BokitCord Stream');
    }

    // Update URL hash cleanly (strip any ?s=...&e=... for movies)
    const watchHash = (season && isTvShow) ? `#movies/watch/${movie.id}?s=${season}&e=${episode || 1}` : `#movies/watch/${movie.id}`;
    if (window.location.hash !== watchHash) {
      history.replaceState({ view: 'movie-player', id: movie.id, s: season, e: episode }, '', watchHash);
    }

    // Close details modal if open
    closeMovieDetailsModal();

    // Switch views
    if (el.moviesListView) el.moviesListView.classList.add('hidden');
    if (el.moviePlayerView) el.moviePlayerView.classList.remove('hidden');

    // Load internal BokitCord embedded player iframe
    const playerUrl = (isTvShow && season)
      ? `/embed/player/tv/${encodeURIComponent(movie.id)}/${season || 1}/${episode || 1}`
      : `/embed/player/movie/${encodeURIComponent(movie.id)}`;

    if (el.playerIframe) {
      el.playerIframe.src = playerUrl;
    }
  }

  function updateServerStatusDot(status = 'healthy') {
    if (!el.moviePlayerServerDot) return;
    el.moviePlayerServerDot.className = `server-status-dot ${status}`;
    if (status === 'healthy') {
      el.moviePlayerServerDot.title = 'Server status: Online';
    } else if (status === 'testing') {
      el.moviePlayerServerDot.title = 'Testing server availability...';
    } else if (status === 'offline') {
      el.moviePlayerServerDot.title = 'Server status: Blocked / Offline';
    }
  }

  function updateMovieServerSelect() {
    if (!el.moviePlayerServerSelect) return;
    el.moviePlayerServerSelect.innerHTML = '';

    currentPlaybackSources.forEach((src, idx) => {
      const opt = document.createElement('option');
      opt.value = String(idx);

      const isUnavailable = src.status === 'unavailable' || Boolean(src.unavailable);
      const label = src.serverLabel || `Server ${idx + 1} — ${src.friendlyName || src.name}`;
      opt.textContent = isUnavailable ? `${label} [Offline / Blocked]` : label;

      if (isUnavailable) {
        opt.disabled = true;
      }
      if (idx === currentPlaybackSourceIndex) {
        opt.selected = true;
      }
      el.moviePlayerServerSelect.appendChild(opt);
    });
  }

  function renderPlayerSourcesBar() {
    if (!el.moviePlayerSourcesList) return;
    el.moviePlayerSourcesList.innerHTML = '';

    currentPlaybackSources.forEach((src, idx) => {
      const isUnavailable = src.status === 'unavailable' || Boolean(src.unavailable);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `source-pill-btn ${idx === currentPlaybackSourceIndex ? 'active' : ''} ${isUnavailable ? 'unavailable' : ''}`;

      const badgeText = isUnavailable ? 'Blocked' : (src.qualityLabel || src.badge || (src.canDownload ? 'Direct' : 'HD'));
      btn.innerHTML = `
        <span>${escapeHtml(src.friendlyName || src.name)}</span>
        <span class="source-pill-badge">${escapeHtml(badgeText)}</span>
      `;

      if (isUnavailable) {
        btn.title = `${src.friendlyName || src.name} is unavailable or blocked on this network`;
      } else {
        btn.title = `Switch to ${src.serverLabel || src.name}`;
      }

      btn.addEventListener('click', () => {
        if (isUnavailable) {
          showResumeToast(`⚠️ ${src.friendlyName || src.name} was blocked or unavailable on this network.`);
          return;
        }
        switchMovieSource(idx, true);
      });
      el.moviePlayerSourcesList.appendChild(btn);
    });
  }

  let movieAutoSwitchTimer = null;
  let movieFallbackTimer = null;

  async function testClientReachability(url, timeoutMs = 2500) {
    if (!url) return false;
    if (url.startsWith('/') || url.includes('/api/movies/media-server')) {
      try {
        const probe = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
        return probe.ok || probe.status === 206 || probe.status === 200;
      } catch (e) {
        return false;
      }
    }
    try {
      // Standard browser fetch in mode: 'no-cors'
      // Succeeds (opaque response) if domain resolves and connects.
      // Rejects with TypeError if connection refused, DNS fails, or Securly / firewall drops it.
      await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
        signal: AbortSignal.timeout(timeoutMs)
      });
      return true;
    } catch (err) {
      console.warn('[Movies] Network reachability test failed for:', url, err.message);
      return false;
    }
  }

  function handleSourceFailure(failedIndex, reason = 'Unavailable') {
    if (failedIndex < 0 || failedIndex >= currentPlaybackSources.length) return;
    const failedSource = currentPlaybackSources[failedIndex];
    failedSource.status = 'unavailable';
    failedSource.unavailable = true;
    failedSource.unavailableReason = reason;

    console.warn(`[Movies] Provider ${failedSource.serverLabel || failedSource.name} marked unavailable:`, reason);

    updateMovieServerSelect();
    renderPlayerSourcesBar();
    updateServerStatusDot('offline');

    // Auto-fallback: Find next configured provider that is not marked unavailable
    const nextIndex = currentPlaybackSources.findIndex((s, idx) => idx !== failedIndex && s.status !== 'unavailable' && !s.unavailable);

    if (nextIndex !== -1) {
      const nextSource = currentPlaybackSources[nextIndex];
      const failedName = failedSource.friendlyName || failedSource.name || `Server ${failedIndex + 1}`;
      const nextName = nextSource.friendlyName || nextSource.name || `Server ${nextIndex + 1}`;
      showResumeToast(`⚠️ ${failedName} is unavailable on this network. Switching to Server ${nextIndex + 1} (${nextName})...`);

      if (movieFallbackTimer) clearTimeout(movieFallbackTimer);
      movieFallbackTimer = setTimeout(() => {
        switchMovieSource(nextIndex, false);
      }, 1200);
    } else {
      // All configured servers are unavailable
      if (el.moviePlayerErrorOverlay) {
        el.moviePlayerErrorOverlay.classList.remove('hidden');
        if (el.movieErrorTitle) el.movieErrorTitle.textContent = 'All Streaming Servers Unavailable';
        if (el.movieErrorDesc) el.movieErrorDesc.textContent = 'All configured streaming servers are currently unreachable on this network. Please verify your connection or try again later.';
        if (el.btnMovieErrorSwitch) el.btnMovieErrorSwitch.classList.add('hidden');
      }
    }
  }

  // Expose on window for diagnostics and external control
  window.handleMovieSourceFailure = handleSourceFailure;
  window.switchMovieSource = switchMovieSource;
  window.launchMovie = launchMovie;
  window.openMovieDetailsModal = openMovieDetailsModal;
  window.openMovieWatchView = (movie, s = null, e = null) => launchMovie(movie, 0, s, e);

  let currentHlsInstance = null;
  let playerControlsHideTimer = null;
  let isScrubberDragging = false;

  async function switchMovieSource(newIndex, savePreference = true) {
    if (movieAutoSwitchTimer) {
      clearTimeout(movieAutoSwitchTimer);
      movieAutoSwitchTimer = null;
    }
    if (movieFallbackTimer) {
      clearTimeout(movieFallbackTimer);
      movieFallbackTimer = null;
    }
    if (newIndex < 0 || newIndex >= currentPlaybackSources.length) return;
    currentPlaybackSourceIndex = newIndex;

    const chosen = currentPlaybackSources[newIndex];
    if (savePreference && chosen && chosen.id) {
      try {
        localStorage.setItem('bokit_movies_preferred_provider', chosen.id);
      } catch (e) {}
    }

    updateMovieServerSelect();
    renderPlayerSourcesBar();

    if (el.moviePlayerErrorOverlay) {
      el.moviePlayerErrorOverlay.classList.add('hidden');
    }
    if (el.btnMovieErrorTrailer) {
      el.btnMovieErrorTrailer.classList.add('hidden');
    }

    // Fetch the new server's direct stream without leaving the watch view
    if (currentPlaybackMovie) {
      updateServerStatusDot('testing');
      try {
        let srcUrl = `/api/movies/sources?id=${encodeURIComponent(currentPlaybackMovie.id)}&server=${encodeURIComponent(chosen.id)}`;
        if (currentPlaybackSeason) {
          srcUrl += `&s=${currentPlaybackSeason}&e=${currentPlaybackEpisode || 1}&type=series`;
        }
        const res = await fetch(srcUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.stream) {
            chosen.streamUrl = data.stream.streamUrl;
            chosen.streamType = data.stream.streamType;
            chosen.subtitles = data.stream.subtitles;
            chosen.qualities = data.stream.qualities;
            chosen.quality = data.stream.quality;
          }
        }
      } catch (e) {
        console.warn('[Movies] Stream refresh warning:', e);
      }
    }

    playActiveSource();
  }

  function setupHlsQualitySelector(hls) {
    if (!el.moviePlayerQualitySelect || !hls || !hls.levels) return;
    el.moviePlayerQualitySelect.innerHTML = '';

    const autoOpt = document.createElement('option');
    autoOpt.value = '-1';
    autoOpt.textContent = 'Auto HD';
    el.moviePlayerQualitySelect.appendChild(autoOpt);

    hls.levels.forEach((lvl, idx) => {
      const opt = document.createElement('option');
      opt.value = String(idx);
      opt.textContent = lvl.height ? `${lvl.height}p` : `Level ${idx + 1}`;
      el.moviePlayerQualitySelect.appendChild(opt);
    });

    el.moviePlayerQualitySelect.onchange = () => {
      const val = parseInt(el.moviePlayerQualitySelect.value, 10);
      hls.currentLevel = val;
      if (val === -1) {
        if (el.ctrlQualityBadge) el.ctrlQualityBadge.textContent = 'Auto';
      } else {
        const lvl = hls.levels[val];
        if (lvl && el.ctrlQualityBadge) el.ctrlQualityBadge.textContent = `${lvl.height}p`;
      }
    };
  }

  function playActiveSource() {
    if (movieAutoSwitchTimer) {
      clearTimeout(movieAutoSwitchTimer);
      movieAutoSwitchTimer = null;
    }
    if (el.moviePlayerErrorOverlay) {
      el.moviePlayerErrorOverlay.classList.add('hidden');
    }
    if (el.btnMovieErrorTrailer) {
      el.btnMovieErrorTrailer.classList.add('hidden');
    }

    const source = currentPlaybackSources[currentPlaybackSourceIndex];
    if (!source) return;

    if (source.status === 'unavailable' || source.unavailable) {
      handleSourceFailure(currentPlaybackSourceIndex, 'Provider marked unavailable');
      return;
    }

    updateServerStatusDot('testing');

    // Update conditional download button in player topbar
    if (el.btnPlayerDownload) {
      if (source.canDownload && (source.downloadUrl || source.streamUrl || source.url)) {
        el.btnPlayerDownload.classList.remove('hidden');
        el.btnPlayerDownload.href = source.downloadUrl || source.streamUrl || source.url;
        el.btnPlayerDownload.setAttribute('download', `${currentPlaybackMovie?.title || 'Movie'}.mp4`);
      } else {
        el.btnPlayerDownload.classList.add('hidden');
        el.btnPlayerDownload.removeAttribute('href');
      }
    }

    const streamUrl = source.streamUrl || source.url;

    // Reject any provider that only offers embedded webpages or lacks direct streams
    const isEmbedOnly = source.streamType === 'embed' || source.type === 'embed' || Boolean(source.isEmbed) || Boolean(source.unsupported);
    if (isEmbedOnly || !streamUrl) {
      console.warn(`[Movies] Provider "${source.friendlyName || source.name}" requires an embedded webpage or has no stream URL. Skipping.`);
      handleSourceFailure(currentPlaybackSourceIndex, `Provider "${source.friendlyName || source.name}" requires an embedded webpage (unsupported — native player only).`);
      return;
    }

    // Direct Video Playback in Native Video Player
    if (el.movieVideoElement) {
      el.movieVideoElement.classList.remove('hidden');
    }
    if (el.movieCustomControls) {
      el.movieCustomControls.classList.remove('hidden');
    }

    // Clean up previous Hls instance
    if (currentHlsInstance) {
      try {
        currentHlsInstance.destroy();
      } catch (e) {}
      currentHlsInstance = null;
    }

    const videoEl = el.movieVideoElement;
    if (!videoEl) return;

    const isHls = source.streamType === 'hls' || source.type === 'hls' || (streamUrl && streamUrl.includes('.m3u8'));

    // Remove existing track elements
    while (videoEl.firstChild) {
      videoEl.removeChild(videoEl.firstChild);
    }

    // Setup Subtitles
    let subsList = [];
    if (source.subtitles && Array.isArray(source.subtitles) && source.subtitles.length > 0) {
      subsList = source.subtitles;
    } else if (currentPlaybackMovie?.subtitleUrl) {
      subsList = [{
        label: 'English',
        srclang: 'en',
        src: currentPlaybackMovie.subtitleUrl,
        default: true
      }];
    }

    if (subsList.length > 0) {
      subsList.forEach((sub, i) => {
        const track = document.createElement('track');
        track.kind = 'subtitles';
        track.label = sub.language || sub.label || `Track ${i + 1}`;
        track.srclang = sub.id || sub.srclang || 'en';
        track.src = sub.url || sub.src;
        if (sub.default || i === 0) track.default = true;
        videoEl.appendChild(track);
      });
    }
    updateSubtitleDropdown(subsList);

    // Resume saved playback progress
    const savedHistory = movieHistory.find(h => String(h.id) === String(currentPlaybackMovie?.id));
    const resumePos = (savedHistory && savedHistory.currentTime >= 2 && (!savedHistory.duration || savedHistory.currentTime < savedHistory.duration - 1))
      ? savedHistory.currentTime
      : 0;

    let hasResumed = false;
    const doResume = () => {
      if (hasResumed) return;
      if (resumePos > 0 && videoEl) {
        try {
          videoEl.currentTime = resumePos;
          showResumeToast(`Resumed from ${formatTimeHMS(resumePos)}`);
          hasResumed = true;
        } catch (e) {}
      }
    };

    if (isHls && window.Hls && Hls.isSupported()) {
      // Native HLS.js streaming
      const hls = new Hls({
        autoStartLoad: true,
        maxBufferLength: 60,
        enableWorker: true
      });
      currentHlsInstance = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(videoEl);

      hls.on(Hls.Events.MANIFEST_PARSED, (e, data) => {
        updateServerStatusDot('healthy');
        setupHlsQualitySelector(hls);
        doResume();
        videoEl.play().catch(() => {});
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (e, data) => {
        const lvl = hls.levels[data.level];
        if (lvl && el.ctrlQualityBadge) {
          el.ctrlQualityBadge.textContent = lvl.height ? `${lvl.height}p` : 'HD';
        }
      });

      hls.on(Hls.Events.ERROR, (e, data) => {
        console.warn('[Movies] HLS streaming event:', data.type, data.details);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              handleSourceFailure(currentPlaybackSourceIndex, `HLS error: ${data.details}`);
              break;
          }
        }
      });
    } else if (isHls && videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari HLS
      videoEl.src = streamUrl;
      videoEl.oncanplay = () => {
        updateServerStatusDot('healthy');
        doResume();
      };
      videoEl.onerror = () => handleSourceFailure(currentPlaybackSourceIndex, 'HTML5 Safari HLS error');
      videoEl.load();
      videoEl.play().catch(() => {});
    } else {
      // Native Direct MP4 / WebM playback
      videoEl.src = streamUrl;
      videoEl.oncanplay = () => {
        updateServerStatusDot('healthy');
        doResume();
      };
      videoEl.onerror = () => handleSourceFailure(currentPlaybackSourceIndex, 'HTML5 direct stream error');
      videoEl.load();
      videoEl.play().catch(() => {});

      if (el.ctrlQualityBadge) {
        el.ctrlQualityBadge.textContent = source.quality || '1080p';
      }
    }

    // Attach custom video control event hooks
    initCustomVideoControls(videoEl);
  }

  function initCustomVideoControls(video) {
    if (!video) return;

    const playIcons = () => {
      if (el.btnCtrlPlay) {
        const iconPlay = el.btnCtrlPlay.querySelector('.icon-play');
        const iconPause = el.btnCtrlPlay.querySelector('.icon-pause');
        if (iconPlay && iconPause) {
          iconPlay.classList.toggle('hidden', !video.paused);
          iconPause.classList.toggle('hidden', video.paused);
        }
      }
      if (el.btnPlayerCenterPlay) {
        el.btnPlayerCenterPlay.classList.toggle('playing', !video.paused);
        const iconPlay = el.btnPlayerCenterPlay.querySelector('.play-icon');
        const iconPause = el.btnPlayerCenterPlay.querySelector('.pause-icon');
        if (iconPlay && iconPause) {
          iconPlay.classList.toggle('hidden', !video.paused);
          iconPause.classList.toggle('hidden', video.paused);
        }
      }
    };

    video.onplay = () => {
      playIcons();
      scheduleControlsHide();
    };

    video.onpause = () => {
      playIcons();
      showControls();
    };

    video.onwaiting = () => {
      if (el.playerBufferingSpinner) el.playerBufferingSpinner.classList.remove('hidden');
    };

    video.onplaying = () => {
      if (el.playerBufferingSpinner) el.playerBufferingSpinner.classList.add('hidden');
      playIcons();
    };

    video.ontimeupdate = () => {
      if (isScrubberDragging || !video.duration) return;
      const progress = (video.currentTime / video.duration) * 100;
      if (el.playerScrubberProgress) el.playerScrubberProgress.style.width = `${progress}%`;
      if (el.playerScrubberHandle) el.playerScrubberHandle.style.left = `${progress}%`;
      if (el.ctrlCurrentTime) el.ctrlCurrentTime.textContent = formatTimeHMS(video.currentTime);
      if (el.ctrlDurationTime) el.ctrlDurationTime.textContent = formatTimeHMS(video.duration);
    };

    video.onprogress = () => {
      if (video.buffered.length > 0 && video.duration) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufPct = (bufferedEnd / video.duration) * 100;
        if (el.playerScrubberBuffer) el.playerScrubberBuffer.style.width = `${bufPct}%`;
      }
    };

    video.onloadedmetadata = () => {
      if (el.ctrlDurationTime) el.ctrlDurationTime.textContent = formatTimeHMS(video.duration);
    };

    // Center play toggle
    if (el.btnPlayerCenterPlay) {
      el.btnPlayerCenterPlay.onclick = () => {
        if (video.paused) video.play().catch(() => {});
        else video.pause();
      };
    }

    // Bottom play button
    if (el.btnCtrlPlay) {
      el.btnCtrlPlay.onclick = () => {
        if (video.paused) video.play().catch(() => {});
        else video.pause();
      };
    }

    // 10s Rewind / Forward
    if (el.btnCtrlRewind10) {
      el.btnCtrlRewind10.onclick = () => {
        video.currentTime = Math.max(0, video.currentTime - 10);
      };
    }
    if (el.btnCtrlForward10) {
      el.btnCtrlForward10.onclick = () => {
        video.currentTime = Math.min(video.duration || Infinity, video.currentTime + 10);
      };
    }

    // Volume Slider & Mute
    if (el.ctrlVolumeSlider) {
      el.ctrlVolumeSlider.value = String(video.volume);
      el.ctrlVolumeSlider.oninput = () => {
        video.volume = parseFloat(el.ctrlVolumeSlider.value);
        video.muted = video.volume === 0;
        updateVolumeIcons(video.muted);
      };
    }

    if (el.btnCtrlVolume) {
      el.btnCtrlVolume.onclick = () => {
        video.muted = !video.muted;
        updateVolumeIcons(video.muted);
      };
    }

    function updateVolumeIcons(isMuted) {
      if (!el.btnCtrlVolume) return;
      const volHigh = el.btnCtrlVolume.querySelector('.icon-vol-high');
      const volMuted = el.btnCtrlVolume.querySelector('.icon-vol-muted');
      if (volHigh && volMuted) {
        volHigh.classList.toggle('hidden', isMuted);
        volMuted.classList.toggle('hidden', !isMuted);
      }
    }

    // Playback Speed Selector
    if (el.moviePlayerSpeedSelect) {
      el.moviePlayerSpeedSelect.onchange = () => {
        video.playbackRate = parseFloat(el.moviePlayerSpeedSelect.value || '1');
      };
    }

    // Fullscreen Toggle
    if (el.btnCtrlFullscreen) {
      el.btnCtrlFullscreen.onclick = () => {
        const stage = el.moviePlayerStage || el.moviePlayerView;
        if (!document.fullscreenElement) {
          stage.requestFullscreen().catch(() => {});
          stage.classList.add('is-fullscreen');
        } else {
          document.exitFullscreen().catch(() => {});
          stage.classList.remove('is-fullscreen');
        }
      };
    }

    // PiP Button
    if (el.btnCtrlPip) {
      el.btnCtrlPip.onclick = async () => {
        try {
          if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
          } else if (document.pictureInPictureEnabled) {
            await video.requestPictureInPicture();
          }
        } catch (e) {}
      };
    }

    // Scrubber interaction
    if (el.playerScrubberContainer) {
      const handleScrub = (e) => {
        const rect = el.playerScrubberTrack.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        if (video.duration) {
          video.currentTime = pos * video.duration;
          if (el.playerScrubberProgress) el.playerScrubberProgress.style.width = `${pos * 100}%`;
          if (el.playerScrubberHandle) el.playerScrubberHandle.style.left = `${pos * 100}%`;
          if (el.ctrlCurrentTime) el.ctrlCurrentTime.textContent = formatTimeHMS(video.currentTime);
        }
      };

      el.playerScrubberContainer.onmousedown = (e) => {
        isScrubberDragging = true;
        handleScrub(e);
        const onMouseMove = (ev) => {
          if (isScrubberDragging) handleScrub(ev);
        };
        const onMouseUp = () => {
          isScrubberDragging = false;
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      };

      // Hover Tooltip
      el.playerScrubberContainer.onmousemove = (e) => {
        if (!el.playerScrubberTooltip || !video.duration) return;
        const rect = el.playerScrubberTrack.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const hoverTime = pos * video.duration;
        el.playerScrubberTooltip.textContent = formatTimeHMS(hoverTime);
        el.playerScrubberTooltip.style.left = `${pos * 100}%`;
        el.playerScrubberTooltip.style.opacity = '1';
      };

      el.playerScrubberContainer.onmouseleave = () => {
        if (el.playerScrubberTooltip) el.playerScrubberTooltip.style.opacity = '0';
      };
    }

    // Auto-hide controls when idle
    const stage = el.moviePlayerStage;
    if (stage) {
      stage.onmousemove = () => {
        showControls();
        scheduleControlsHide();
      };
      stage.onmouseleave = () => {
        if (!video.paused) stage.classList.add('idle-hide');
      };
    }

    function showControls() {
      if (stage) stage.classList.remove('idle-hide');
    }

    function scheduleControlsHide() {
      if (playerControlsHideTimer) clearTimeout(playerControlsHideTimer);
      playerControlsHideTimer = setTimeout(() => {
        if (stage && !video.paused) {
          stage.classList.add('idle-hide');
        }
      }, 3500);
    }
  }

  function closeMoviePlayer() {
    if (movieAutoSwitchTimer) {
      clearTimeout(movieAutoSwitchTimer);
      movieAutoSwitchTimer = null;
    }
    if (movieFallbackTimer) {
      clearTimeout(movieFallbackTimer);
      movieFallbackTimer = null;
    }
    if (currentHlsInstance) {
      try {
        currentHlsInstance.destroy();
      } catch (e) {}
      currentHlsInstance = null;
    }
    if (el.moviePlayerErrorOverlay) {
      el.moviePlayerErrorOverlay.classList.add('hidden');
    }
    if (el.btnMovieErrorTrailer) {
      el.btnMovieErrorTrailer.classList.add('hidden');
    }
    if (el.playerIframe) {
      el.playerIframe.src = 'about:blank';
    }
    currentPlaybackMovie = null;
    currentPlaybackSeason = null;
    currentPlaybackEpisode = null;

    if (el.movieVideoElement) {
      el.movieVideoElement.pause();
      el.movieVideoElement.removeAttribute('src');
      el.movieVideoElement.load();
    }

    if (el.moviePlayerStage) {
      el.moviePlayerStage.classList.remove('is-fullscreen');
    }

    if (el.moviePlayerView) el.moviePlayerView.classList.add('hidden');
    if (el.moviesListView) el.moviesListView.classList.remove('hidden');
    updateSubtitleDropdown([]);

    if (window.location.hash.startsWith('#movies/watch')) {
      history.pushState({ view: 'movies-library' }, '', '#movies');
    }
  }

  // Listen for messages from the internal embedded player
  window.addEventListener('message', (event) => {
    if (!event.data) return;
    if (event.data.type === 'close-player' || event.data.type === 'BOKIT_CLOSE_PLAYER') {
      closeMoviePlayer();
    } else if (event.data.type === 'BOKIT_VIDEO_PROGRESS') {
      updateContinueWatching(event.data);
    } else if (event.data.type === 'BOKIT_EPISODE_CHANGED') {
      const s = parseInt(event.data.season, 10) || 1;
      const e = parseInt(event.data.episode, 10) || 1;
      currentPlaybackSeason = s;
      currentPlaybackEpisode = e;
      if (el.moviePlayerTitle) {
        const baseTitle = (currentPlaybackMovie && currentPlaybackMovie.title) || event.data.title || 'TV Series';
        el.moviePlayerTitle.textContent = `${baseTitle} — S${s}:E${e}`;
      }
      const id = (currentPlaybackMovie && currentPlaybackMovie.id) || event.data.id;
      if (id) {
        const watchHash = `#movies/watch/${id}?s=${s}&e=${e}`;
        if (window.location.hash !== watchHash) {
          history.replaceState({ view: 'movie-player', id, s, e }, '', watchHash);
        }
      }
      if (currentPlaybackMovie) {
        saveMovieHistoryItem(currentPlaybackMovie, s, e, 15);
      }
    } else if (event.data.type === 'BOKIT_OPEN_DIAGNOSTICS') {
      openProviderStatusModal(event.data.provider, event.data.id);
    }
  });

  function updateSubtitleDropdown(subsList) {
    if (!el.playerSubtitlePill || !el.moviePlayerSubtitleSelect) return;
    if (!subsList || subsList.length === 0) {
      el.playerSubtitlePill.classList.add('hidden');
      return;
    }
    el.playerSubtitlePill.classList.remove('hidden');
    el.moviePlayerSubtitleSelect.innerHTML = '<option value="off">Off</option>';
    subsList.forEach((sub, idx) => {
      const opt = document.createElement('option');
      opt.value = String(idx);
      opt.textContent = sub.label || `Subtitle ${idx + 1}`;
      if (sub.default || idx === 0) opt.selected = true;
      el.moviePlayerSubtitleSelect.appendChild(opt);
    });

    el.moviePlayerSubtitleSelect.onchange = () => {
      const val = el.moviePlayerSubtitleSelect.value;
      if (!el.movieVideoElement || !el.movieVideoElement.textTracks) return;
      for (let i = 0; i < el.movieVideoElement.textTracks.length; i++) {
        if (val === 'off') {
          el.movieVideoElement.textTracks[i].mode = 'disabled';
        } else if (parseInt(val, 10) === i) {
          el.movieVideoElement.textTracks[i].mode = 'showing';
        } else {
          el.movieVideoElement.textTracks[i].mode = 'disabled';
        }
      }
    };
  }

  // ============================================================================
  // PROVIDER DIAGNOSTICS & STATUS MODAL (P-Stream Health Architecture)
  // ============================================================================
  let isTestingProviders = false;

  async function openProviderStatusModal(provider = null, id = null) {
    if (!el.movieStatusModal) return;
    el.movieStatusModal.classList.remove('hidden');
    await loadProviderStatusData();
    if (provider && id) {
      if (el.diagSelectProvider) el.diagSelectProvider.value = provider;
      if (el.diagInputId) el.diagInputId.value = id;
      await loadTelemetryDiagnostics(provider, id);
    }
  }

  function closeProviderStatusModal() {
    if (el.movieStatusModal) {
      el.movieStatusModal.classList.add('hidden');
    }
  }

  async function loadTelemetryDiagnostics(provider = 'vidrift', id = '4247') {
    if (!el.statusTelemetryTbody) return;
    el.statusTelemetryTbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:12px;color:#94a3b8;">Inspecting provider "${escapeHtml(provider)}" with ID ${escapeHtml(id)}...</td></tr>`;

    try {
      const res = await fetch(`/api/movies/diagnostics/${encodeURIComponent(provider)}/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();

      const metrics = [
        { num: 1, label: '1. Provider Name', val: d.providerName, badge: 'badge-tag-purple' },
        { num: 2, label: '2. Original Provider URL', val: d.originalUrl || 'N/A', code: true },
        { num: 3, label: '3. BokitCord Proxied URL', val: d.proxiedUrl || 'N/A', code: true },
        { num: 4, label: '4. HTTP Status Code', val: d.httpStatus || 200, badge: (d.httpStatus === 200 ? 'badge-tag-green' : 'badge-tag-red') },
        { num: 5, label: '5. Redirect Chain', val: Array.isArray(d.redirectChain) && d.redirectChain.length > 0 ? d.redirectChain.join(' → ') : 'Direct (0 redirects)' },
        { num: 6, label: '6. Content-Type Header', val: d.contentType || 'video/mp4', badge: 'badge-tag-cyan' },
        { num: 7, label: '7. Proxy Validation Status', val: d.proxyStatus || 'Allowed', badge: (d.proxyStatus === 'Allowed' ? 'badge-tag-green' : 'badge-tag-purple') },
        { num: 8, label: '8. Blocked Dangerous Resources', val: Array.isArray(d.blockedResources) && d.blockedResources.length > 0 ? d.blockedResources.join(', ') : '0 (Safe & Sandboxed)' },
        { num: 9, label: '9. Media Requests Streamed', val: `${d.mediaRequests || 1} requests`, badge: 'badge-tag-blue' },
        { num: 10, label: '10. Range / 206 Partial Content', val: d.rangeStatus || 'Supported', badge: 'badge-tag-green' },
        { num: 11, label: '11. Frame / Sandbox Errors', val: d.frameErrors || 'None (Clean in-app embed)' },
        { num: 12, label: '12. JavaScript / Console Errors', val: d.jsErrors || 'None (Clean execution)' }
      ];

      el.statusTelemetryTbody.innerHTML = '';
      metrics.forEach(m => {
        const tr = document.createElement('tr');
        let valHtml = '';
        if (m.badge) {
          valHtml = `<span class="${m.badge}">${escapeHtml(String(m.val))}</span>`;
        } else if (m.code) {
          valHtml = `<code style="font-size:11px;word-break:break-all;color:#e2e8f0;background:rgba(0,0,0,0.4);padding:2px 6px;border-radius:4px;">${escapeHtml(String(m.val))}</code>`;
        } else {
          valHtml = `<span style="color:#cbd5e1;font-size:12px;">${escapeHtml(String(m.val))}</span>`;
        }

        tr.innerHTML = `
          <td><span style="font-family:monospace;color:#94a3b8;font-weight:600;">#${m.num}</span></td>
          <td><strong>${escapeHtml(m.label)}</strong></td>
          <td>${valHtml}</td>
        `;
        el.statusTelemetryTbody.appendChild(tr);
      });
    } catch (err) {
      el.statusTelemetryTbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:12px;color:#ed4245;">Failed to fetch telemetry: ${escapeHtml(err.message)}</td></tr>`;
    }
  }

  async function loadProviderStatusData() {
    try {
      const res = await fetch('/api/movies/debug');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      renderProviderStatusData(data);
    } catch (e) {
      console.error('[Movies] Failed to load provider debug status:', e);
    }
    const prov = (el.diagSelectProvider && el.diagSelectProvider.value) || 'vidrift';
    const id = (el.diagInputId && el.diagInputId.value) || '4247';
    loadTelemetryDiagnostics(prov, id);
  }

  async function triggerLiveProviderRetest() {
    if (isTestingProviders) return;
    isTestingProviders = true;
    if (el.btnRetestProviders) {
      el.btnRetestProviders.disabled = true;
      el.btnRetestProviders.innerHTML = '<span class="status-pulse-indicator" style="width:10px;height:10px"></span> Probing Adapters...';
    }

    try {
      const res = await fetch('/api/movies/providers/health', { method: 'POST' });
      const healthList = await res.json();
      await loadProviderStatusData();
    } catch (e) {
      console.error('[Movies] Retest error:', e);
    } finally {
      isTestingProviders = false;
      if (el.btnRetestProviders) {
        el.btnRetestProviders.disabled = false;
        el.btnRetestProviders.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          <span>Run Live Health Test</span>
        `;
      }
    }
  }

  function renderProviderStatusData(data) {
    if (!data) return;

    const allHealth = data.health || [];
    const healthyCount = allHealth.filter(h => h.status === 'healthy').length;
    const totalCount = allHealth.length;

    let totalLat = 0;
    let latCount = 0;
    allHealth.forEach(h => {
      if (typeof h.latencyMs === 'number' && h.latencyMs > 0 && h.latencyMs < 5000) {
        totalLat += h.latencyMs;
        latCount++;
      }
    });
    const avgLat = latCount > 0 ? Math.round(totalLat / latCount) : 0;

    if (el.metricHealthyCount) el.metricHealthyCount.textContent = healthyCount;
    if (el.metricTotalCount) el.metricTotalCount.textContent = `${totalCount} configured`;
    if (el.metricAvgLatency) el.metricAvgLatency.textContent = `${avgLat} ms`;
    if (el.metricLocalCount) el.metricLocalCount.textContent = `${data.localMedia?.itemsCount || 0} items`;
    if (el.metricLocalBytes) {
      const mb = Math.round((data.localMedia?.totalBytes || 0) / (1024 * 1024));
      el.metricLocalBytes.textContent = `${mb} MB on disk`;
    }

    // Render Playback table
    if (el.statusPlaybackTbody && data.providers?.playback) {
      el.statusPlaybackTbody.innerHTML = '';
      data.providers.playback.forEach((p, idx) => {
        const h = allHealth.find(item => item.id === p.id) || {};
        const status = h.status || p.status || 'unknown';
        const latency = typeof h.latencyMs === 'number' ? h.latencyMs : p.latencyMs || 0;
        const latencyClass = latency < 250 ? 'fast' : latency < 900 ? 'medium' : 'slow';
        const statusClass = status === 'healthy' ? 'online' : status === 'degraded' ? 'degraded' : 'offline';
        const statusLabel = status === 'healthy' ? 'Online' : status === 'degraded' ? 'Degraded' : 'Offline';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>
            <strong>Server ${idx + 1} — ${escapeHtml(p.name)}</strong>
            <div style="font-size:11px;color:#949ba4;">${escapeHtml(p.id)}</div>
          </td>
          <td><span class="badge-tag-cyan">${escapeHtml(p.playbackType || p.type || 'stream')}</span></td>
          <td><span style="font-weight:600;color:#dbdee1;">${escapeHtml(p.badge || 'HD')}</span></td>
          <td><span class="status-pill ${statusClass}">${statusLabel}</span></td>
          <td><span class="status-latency-badge ${latencyClass}">${latency} ms</span></td>
          <td>${p.canDownload ? '<span class="badge-tag-green">Allowed</span>' : '<span style="color:#72767d">Disabled</span>'}</td>
          <td><span style="font-family:monospace;color:${(h.errorCount || 0) > 0 ? '#f0b232' : '#23a55a'}">${h.errorCount || 0}</span></td>
        `;
        el.statusPlaybackTbody.appendChild(tr);
      });
    }

    // Render Metadata table
    if (el.statusMetadataTbody && data.providers?.metadata) {
      el.statusMetadataTbody.innerHTML = '';
      data.providers.metadata.forEach(p => {
        const h = allHealth.find(item => item.id === p.id) || {};
        const status = h.status || p.status || 'unknown';
        const latency = typeof h.latencyMs === 'number' ? h.latencyMs : p.latencyMs || 0;
        const latencyClass = latency < 250 ? 'fast' : latency < 900 ? 'medium' : 'slow';
        const statusClass = status === 'healthy' ? 'online' : status === 'degraded' ? 'degraded' : 'offline';
        const statusLabel = status === 'healthy' ? 'Active' : status === 'degraded' ? 'Degraded' : 'Offline';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${escapeHtml(p.name)}</strong></td>
          <td><span class="badge-tag-purple">Metadata / Search</span></td>
          <td><span class="status-pill ${statusClass}">${statusLabel}</span></td>
          <td><span class="status-latency-badge ${latencyClass}">${latency} ms</span></td>
          <td><span class="badge-tag-green">Configured</span></td>
          <td><span style="font-family:monospace;color:${(h.errorCount || 0) > 0 ? '#f0b232' : '#23a55a'}">${h.errorCount || 0}</span></td>
        `;
        el.statusMetadataTbody.appendChild(tr);
      });
    }
  }

  window.openProviderStatusModal = openProviderStatusModal;
  window.closeProviderStatusModal = closeProviderStatusModal;

  async function handleMovieHashRoute() {
    const hash = window.location.hash;
    if (!hash.startsWith('#movies')) return;

    if (el.moviesView && el.moviesView.classList.contains('hidden')) {
      switchAppTab('movies');
    }

    if (hash.startsWith('#movies/watch/')) {
      const match = hash.match(/#movies\/watch\/([^?&]+)(?:\?s=(\d+)&e=(\d+))?/);
      if (match) {
        const id = match[1];
        let s = match[2] ? parseInt(match[2], 10) : null;
        let e = match[3] ? parseInt(match[3], 10) : null;
        if (!currentPlaybackMovie || currentPlaybackMovie.id !== id) {
          const isExplicitLocal = String(id).startsWith('local-');
          let found = allCatalogMovies.find(m => String(m.id) === String(id)) ||
                      allLocalMovies.find(m => String(m.id) === String(id));
          if (!found) {
            if (isExplicitLocal) {
              found = { id: id, title: decodeURIComponent(id.replace(/^local-/, '').replace(/-/g, ' ')), isLocal: true, canDownload: true };
            } else {
              try {
                const detRes = await fetch(`/api/movies/detail?id=${encodeURIComponent(id)}${s ? `&s=${s}&e=${e || 1}` : ''}`);
                if (detRes.ok) {
                  found = await detRes.json();
                }
              } catch (err) {}
              if (!found) {
                found = { id: id, title: 'Streaming Title' };
              }
            }
          }
          const isTvShow = (found.type === 'series' || found.category === 'series' || Boolean(found.totalSeasons && found.totalSeasons > 0) || s !== null) && !found.isLocal && !String(found.id).startsWith('local-');
          if (isTvShow && (!s || !e)) {
            s = s || 1;
            e = e || 1;
          } else if (!isTvShow) {
            s = null;
            e = null;
          }
          launchMovie(found, 0, s, e);
        }
      }
    } else if (hash.startsWith('#movies/detail/')) {
      const id = hash.replace('#movies/detail/', '').trim();
      let found = allCatalogMovies.find(m => String(m.id) === String(id)) ||
                  allLocalMovies.find(m => String(m.id) === String(id));
      if (!found) {
        try {
          const detRes = await fetch(`/api/movies/detail?id=${encodeURIComponent(id)}`);
          if (detRes.ok) {
            found = await detRes.json();
          }
        } catch (err) {}
        if (!found) {
          found = { id: id, title: 'Movie Details' };
        }
      }
      openMovieDetailsModal(found);
    } else if (hash === '#movies' || hash === '#movies/') {
      if (el.moviePlayerView && !el.moviePlayerView.classList.contains('hidden')) {
        closeMoviePlayer();
      }
      if (el.movieDetailsModal && !el.movieDetailsModal.classList.contains('hidden')) {
        closeMovieDetailsModal();
      }
      if (el.movieTrailerModal && !el.movieTrailerModal.classList.contains('hidden')) {
        closeTrailerModal();
      }
    }
  }

  function setupMoviesListeners() {
    if (el.btnMovieBack) {
      el.btnMovieBack.addEventListener('click', closeMoviePlayer);
    }

    if (el.btnCloseMovieModal) {
      el.btnCloseMovieModal.addEventListener('click', closeMovieDetailsModal);
    }

    if (el.btnModalWatchNow) {
      el.btnModalWatchNow.addEventListener('click', () => {
        if (activeDetailMovie) {
          const isTvShow = (activeDetailMovie.type === 'series' || activeDetailMovie.category === 'series' || Boolean(activeDetailMovie.totalSeasons && activeDetailMovie.totalSeasons > 0)) && !activeDetailMovie.isLocal && !String(activeDetailMovie.id).startsWith('local-');
          launchMovie(
            activeDetailMovie,
            selectedDetailSourceIndex,
            isTvShow ? (activeDetailSeason || 1) : null,
            isTvShow ? (activeDetailEpisode || 1) : null
          );
        }
      });
    }

    if (el.btnModalTrailer) {
      el.btnModalTrailer.addEventListener('click', () => {
        if (activeDetailMovie) {
          openTrailerModal(activeDetailMovie.title, activeDetailMovie.year);
        }
      });
    }

    if (el.btnModalWatchlist) {
      el.btnModalWatchlist.addEventListener('click', () => {
        if (activeDetailMovie) {
          toggleMovieWatchlist(activeDetailMovie);
        }
      });
    }

    if (el.btnCloseTrailerModal) {
      el.btnCloseTrailerModal.addEventListener('click', closeTrailerModal);
    }

    if (el.movieTrailerModal) {
      el.movieTrailerModal.addEventListener('click', (e) => {
        if (e.target === el.movieTrailerModal) closeTrailerModal();
      });
    }

    if (el.btnClearContinueWatching) {
      el.btnClearContinueWatching.addEventListener('click', clearAllMovieHistory);
    }

    if (el.moviesTypeFilter) {
      el.moviesTypeFilter.addEventListener('change', (e) => {
        activeTypeFilter = e.target.value;
        applyMoviesFilter();
      });
    }

    if (el.moviesYearFilter) {
      el.moviesYearFilter.addEventListener('change', (e) => {
        activeYearFilter = e.target.value;
        applyMoviesFilter();
      });
    }

    if (el.movieModalSeasonSelect) {
      el.movieModalSeasonSelect.addEventListener('change', (e) => {
        const s = parseInt(e.target.value, 10) || 1;
        activeDetailSeason = s;
        activeDetailEpisode = 1;
        if (activeDetailMovie) {
          fetchAndRenderEpisodes(activeDetailMovie.id, s);
        }
      });
    }

    if (el.moviePlayerServerSelect) {
      el.moviePlayerServerSelect.addEventListener('change', (e) => {
        const newIndex = parseInt(e.target.value, 10) || 0;
        switchMovieSource(newIndex, true);
      });
    }

    if (el.btnPlayerPrevEp) {
      el.btnPlayerPrevEp.addEventListener('click', () => {
        if (currentPlaybackMovie && currentPlaybackEpisode && currentPlaybackEpisode > 1) {
          launchMovie(currentPlaybackMovie, currentPlaybackSourceIndex, currentPlaybackSeason, currentPlaybackEpisode - 1);
        }
      });
    }

    if (el.btnPlayerNextEp) {
      el.btnPlayerNextEp.addEventListener('click', () => {
        if (currentPlaybackMovie && currentPlaybackSeason) {
          const nextEp = (currentPlaybackEpisode || 1) + 1;
          launchMovie(currentPlaybackMovie, currentPlaybackSourceIndex, currentPlaybackSeason, nextEp);
        }
      });
    }

    if (el.moviePlayerEpSelect) {
      el.moviePlayerEpSelect.addEventListener('change', (e) => {
        const ep = parseInt(e.target.value, 10) || 1;
        if (currentPlaybackMovie && currentPlaybackSeason) {
          launchMovie(currentPlaybackMovie, currentPlaybackSourceIndex, currentPlaybackSeason, ep);
        }
      });
    }

    if (el.btnMovieProvidersDebug) {
      el.btnMovieProvidersDebug.addEventListener('click', () => {
        openProviderStatusModal();
      });
    }

    if (el.btnMoviePlayerDiagnostics) {
      el.btnMoviePlayerDiagnostics.addEventListener('click', () => {
        openProviderStatusModal();
      });
    }

    if (el.btnCloseMovieStatusModal) {
      el.btnCloseMovieStatusModal.addEventListener('click', () => {
        closeProviderStatusModal();
      });
    }

    if (el.btnRetestProviders) {
      el.btnRetestProviders.addEventListener('click', () => {
        triggerLiveProviderRetest();
      });
    }

    if (el.btnRunDiag) {
      el.btnRunDiag.addEventListener('click', () => {
        const prov = (el.diagSelectProvider && el.diagSelectProvider.value) || 'vidrift';
        const id = (el.diagInputId && el.diagInputId.value) || '4247';
        loadTelemetryDiagnostics(prov, id);
      });
    }

    if (el.movieStatusModal) {
      el.movieStatusModal.addEventListener('click', (e) => {
        if (e.target === el.movieStatusModal) {
          closeProviderStatusModal();
        }
      });
    }

    if (el.btnRefreshMovies) {
      el.btnRefreshMovies.addEventListener('click', () => {
        loadMoviesList();
      });
    }

    if (el.btnRescanEmpty) {
      el.btnRescanEmpty.addEventListener('click', () => {
        if (el.moviesSearchInput) el.moviesSearchInput.value = '';
        activeGenreFilter = 'all';
        activeTypeFilter = 'all';
        activeYearFilter = 'all';
        if (el.moviesTypeFilter) el.moviesTypeFilter.value = 'all';
        if (el.moviesYearFilter) el.moviesYearFilter.value = 'all';
        loadMoviesList();
      });
    }

    if (el.moviesSearchInput) {
      el.moviesSearchInput.addEventListener('input', () => {
        const val = el.moviesSearchInput.value.trim();
        if (el.btnClearMoviesSearch) {
          el.btnClearMoviesSearch.classList.toggle('hidden', !val);
        }

        clearTimeout(movieSearchDebounceTimer);
        movieSearchDebounceTimer = setTimeout(() => {
          applyMoviesFilter();
        }, 300);
      });

      el.moviesSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          clearTimeout(movieSearchDebounceTimer);
          applyMoviesFilter();
        }
      });
    }

    if (el.btnMoviesSearchSubmit) {
      el.btnMoviesSearchSubmit.addEventListener('click', () => {
        clearTimeout(movieSearchDebounceTimer);
        applyMoviesFilter();
      });
    }

    if (el.btnClearMoviesSearch) {
      el.btnClearMoviesSearch.addEventListener('click', () => {
        if (el.moviesSearchInput) {
          el.moviesSearchInput.value = '';
          el.btnClearMoviesSearch.classList.add('hidden');
          applyMoviesFilter();
          el.moviesSearchInput.focus();
        }
      });
    }

    if (el.btnMovieFullscreen) {
      el.btnMovieFullscreen.addEventListener('click', () => {
        if (!el.moviePlayerView) return;
        if (!document.fullscreenElement) {
          el.moviePlayerView.requestFullscreen().catch(e => console.error(e));
        } else {
          document.exitFullscreen().catch(e => console.error(e));
        }
      });
    }

    if (el.btnMoviePip) {
      el.btnMoviePip.addEventListener('click', async () => {
        if (!el.movieVideoElement || el.movieVideoElement.classList.contains('hidden')) return;
        try {
          if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
          } else if (document.pictureInPictureEnabled) {
            await el.movieVideoElement.requestPictureInPicture();
          }
        } catch (e) {
          console.error('[Movies] PiP error:', e);
        }
      });
    }

    // Video Playback Progress Saving
    if (el.movieVideoElement) {
      let lastSaveTs = 0;
      el.movieVideoElement.addEventListener('timeupdate', () => {
        const v = el.movieVideoElement;
        if (!v || !currentPlaybackMovie || !v.duration) return;
        const now = Date.now();
        if (now - lastSaveTs > 2500) {
          lastSaveTs = now;
          const pct = Math.min(100, Math.round((v.currentTime / v.duration) * 100));
          saveMovieHistoryItem(
            currentPlaybackMovie,
            currentPlaybackSeason,
            currentPlaybackEpisode,
            pct,
            v.currentTime,
            v.duration
          );
        }
      });

      el.movieVideoElement.addEventListener('pause', () => {
        const v = el.movieVideoElement;
        if (!v || !currentPlaybackMovie || !v.duration) return;
        const pct = Math.min(100, Math.round((v.currentTime / v.duration) * 100));
        saveMovieHistoryItem(
          currentPlaybackMovie,
          currentPlaybackSeason,
          currentPlaybackEpisode,
          pct,
          v.currentTime,
          v.duration
        );
      });

      el.movieVideoElement.addEventListener('ended', () => {
        if (currentPlaybackMovie) {
          saveMovieHistoryItem(
            currentPlaybackMovie,
            currentPlaybackSeason,
            currentPlaybackEpisode,
            100,
            0,
            0
          );
        }
      });
    }

    // Pagination & Infinite Scroll Listeners
    if (el.btnMoviesLoadMore) {
      el.btnMoviesLoadMore.addEventListener('click', () => {
        loadMoreMovies();
      });
    }

    if (window.IntersectionObserver && el.moviesInfiniteAnchor) {
      moviesInfiniteObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const hasMore = (isCatalogSearching || activeGenreFilter === 'watchlist' || activeGenreFilter === 'local')
              ? (currentFilteredMovies.length > moviesDisplayedLimit)
              : (catalogCurrentPage < catalogTotalPages);
            if (hasMore) {
              loadMoreMovies();
            }
          }
        });
      }, { rootMargin: '300px' });
      moviesInfiniteObserver.observe(el.moviesInfiniteAnchor);
    }

    // Close details modal on clicking outside card
    if (el.movieDetailsModal) {
      el.movieDetailsModal.addEventListener('click', (e) => {
        if (e.target === el.movieDetailsModal) {
          closeMovieDetailsModal();
        }
      });
    }

    // Clean hash routing back/forward browser button navigation
    window.addEventListener('hashchange', handleMovieHashRoute);
    window.addEventListener('popstate', handleMovieHashRoute);

    // Process initial hash route if already present on page load
    if (window.location.hash && window.location.hash.startsWith('#movies/')) {
      setTimeout(handleMovieHashRoute, 250);
    }

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      // Escape closes trailer or details modal first if open
      if (e.code === 'Escape') {
        if (el.movieTrailerModal && !el.movieTrailerModal.classList.contains('hidden')) {
          closeTrailerModal();
          return;
        }
        if (el.movieDetailsModal && !el.movieDetailsModal.classList.contains('hidden')) {
          closeMovieDetailsModal();
          return;
        }
      }

      if (!el.moviePlayerView || el.moviePlayerView.classList.contains('hidden')) return;
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      const v = el.movieVideoElement;
      if (!v || v.classList.contains('hidden')) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (v.paused) v.play();
        else v.pause();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        if (!document.fullscreenElement) el.moviePlayerView.requestFullscreen().catch(() => {});
        else document.exitFullscreen().catch(() => {});
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        v.muted = !v.muted;
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        v.currentTime = Math.min(v.duration || Infinity, v.currentTime + 10);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        v.currentTime = Math.max(0, v.currentTime - 10);
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        v.volume = Math.min(1, v.volume + 0.1);
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        v.volume = Math.max(0, v.volume - 0.1);
      } else if (e.code === 'Escape') {
        if (!document.fullscreenElement) {
          closeMoviePlayer();
        }
      }
    });
  }

  // Start app on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();
