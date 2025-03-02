import { TranslatedMessages } from './index'

export const en: TranslatedMessages = {
  // login
  'login.welcomeMessage': 'Log in to the app with electronic ID',
  'login.loginButtonText': 'Login',
  'login.languageButtonText': 'Íslenska',
  'login.needHelpButtonText': 'Need help?',
  'login.outdatedBrowserTitle': 'Outdated browser',
  'login.outdatedBrowserMessage':
    'You have an unsupported browser version, please update it through the Play Store.',
  'login.outdatedBrowserUpdateButton': 'Update',
  'login.outdatedBrowserCancelButton': 'Cancel',
  'login.networkErrorTitle': 'Network error',
  'login.networkErrorMessage':
    '\nCould not contact the login service.\n\nPlease check your device internet connection or try again later.',
  'login.expiredTitle': 'Session expired',
  'login.expiredScopesMessage':
    'Updated permissions required, please login again.',
  'login.expiredMissingUserMessage':
    'Could not fetch user information, please login again.',

  // app lock
  'applock.title': 'Enter a 4-digit PIN',
  'applock.attempts': 'attempts left',

  // onboarding
  'onboarding.notifications.title':
    'Receive notifications of new documents as soon as they are received.',
  'onboarding.notifications.allowNotificationsButtonText':
    'Allow notifications',
  'onboarding.notifications.decideLaterButtonText': 'Decide later',
  'onboarding.appLock.title':
    'Screen lock ensures that no one can open the app except you.',
  'onboarding.appLock.choosePinButtonText': 'Choose PIN',
  'onboarding.pinCode.enterPin': 'Choose 4-digit PIN',
  'onboarding.pinCode.confirmPin': 'Confirm the 4-digit PIN',
  'onboarding.pinCode.goBackButtonText': 'Go back',
  'onboarding.pinCode.cancelButtonText': 'Cancel',
  'onboarding.pinCode.nonMatchingPinCodes': 'The numbers did not match',
  'onboarding.biometrics.title':
    'You can also use {biometricType} to access the app without entering a PIN.',
  'onboarding.biometrics.notEnrolled':
    "Your device supports {biometricType} but you haven't enrolled into it yet.",
  'onboarding.biometrics.noAuthenticationTypes':
    'Your device does not support biometrics',
  'onboarding.biometrics.useBiometricsButtonText': 'Use {biometricType}',
  'onboarding.biometrics.skipButtonText': 'Skip for now',
  'onboarding.biometrics.type.faceId': 'Face ID',
  'onboarding.biometrics.type.biometrics': 'biometrics',
  'onboarding.biometrics.type.fingerprint': 'fingerprint',
  'onboarding.biometrics.type.iris': 'iris scanner',
  'onboarding.pinKeypad.accessibilityLabel.faceId': 'Use FaceID',
  'onboarding.pinKeypad.accessibilityLabel.iris': 'Use Iris',
  'onboarding.pinKeypad.accessibilityLabel.fingerprint': 'Use fingerprint',
  'onboarding.pinKeypad.accessibilityLabel.delete': 'Delete character',

  // personal info screen
  'personalInfo.screenTitle': 'Personal info',

  // user
  'user.screenTitle': 'User',
  'user.tabs.preferences': 'Settings',
  'user.tabs.personalInfo': 'Personal info',

  // setting screen
  'setting.screenTitle': 'Settings',

  // user: settings
  'settings.infoBoxText': 'Configure your app preferences',
  'settings.accessibilityLayout.groupTitle': 'Layout and accessibility',
  'settings.accessibilityLayout.language': 'Language',
  'settings.accessibilityLayout.sytemDarkMode': 'Use system appearance',
  'settings.accessibilityLayout.darkMode': 'Dark mode',
  'settings.usersettings.groupTitle': 'My settings',
  'settings.usersettings.telephone': 'Telephone',
  'settings.usersettings.email': 'Email',
  'settings.usersettings.bankinfo': 'Bank info',
  'settings.communication.groupTitle': 'Notifications and communication',
  'settings.communication.newNotificationsEmailLabel': 'Notifications in email',
  'settings.communication.newNotificationsEmailDescription':
    'Government agencies can send you notifications in email.',
  'settings.communication.newNotificationsErrorTitle': 'Error',
  'settings.communication.newNotificationsErrorDescription':
    'Failed to update settings',
  'settings.communication.newNotificationsInAppLabel':
    'Notifications in the Island.is app',
  'settings.communication.newNotificationsInAppDescription':
    'Government agencies can send you notifications in the Island.is app.',
  'settings.security.privacyTitle': 'Privacy Policy',
  'settings.security.privacySubTitle': 'Digital Iceland',
  'settings.security.groupTitle': 'Security and privacy',
  'settings.security.changePinLabel': 'Change PIN',
  'settings.security.changePinDescription': 'Choose a new 4-digit PIN number',
  'settings.security.useBiometricsLabel': 'Use {biometricType}',
  'settings.security.useBiometricsDescription':
    'With {biometricType} you don’t need to enter PIN',
  'settings.security.createPasskeyLabel': 'Create a passkey',
  'settings.security.createPasskeyDescription':
    'To automatically sign in to Island.is through the app in this device',
  'settings.security.removePasskeyLabel': 'Delete passkey',
  'settings.security.removePasskeyDescription':
    'By deleting your passkey you skip signing in automatically to Island.is with the app',
  'settings.security.removePasskeyPromptTitle':
    'Do you want to delete the passkey?',
  'settings.security.removePasskeyPromptDescription':
    'By deleting your passkey you can not sign in automatically to Island.is with the app',
  'settings.security.removePasskeyButton': 'Delete',
  'settings.security.removePasskeyCancelButton': 'Cancel',
  'settings.security.appLockTimeoutLabel': 'App lock timeout',
  'settings.security.appLockTimeoutDescription':
    'Time until app lock will appear',
  'settings.security.appLockTimeoutSeconds': 'sec.',
  'settings.about.groupTitle': 'About',
  'settings.about.versionLabel': 'Version',
  'settings.about.logoutLabel': 'Logout',
  'settings.about.logoutDescription': 'You will have to login again',
  'settings.about.codePushLabel': 'Updates',
  'settings.about.codePushLoading': 'Loading...',
  'settings.about.codePushUpToDate': 'The app is up to date',
  'settings.about.codePushUpToDateTitle': 'Up to date',
  'settings.about.codePushUpdateCancelledTitle': 'Update cancelled',
  'settings.about.codePushUpdateCancelledDescription':
    'The update was cancelled',
  'settings.about.codePushUpdateInstalledTitle': 'Update installed',
  'settings.about.codePushUpdateInstalledDescription':
    'The app has been updated',
  'settings.about.codePushUpdateErrorTitle': 'Unknown error',
  'settings.about.codePushUpdateErrorDescription': 'An unknown error occurred',

  // user: personal info
  'user.natreg.infoBox': 'Your registration at Registers Iceland',
  'user.natreg.displayName': 'Full name',
  'user.natreg.nationalId': 'Social ID',
  'user.natreg.birthPlace': 'Birthplace',
  'user.natreg.legalResidence': 'Legal domicile',
  'user.natreg.gender': 'Gender',
  'user.natreg.genderValue': `{
    gender,
    select,
    FEMALE {Female}
    MALE {Male}
    TRANSGENDER {Transgender}
    MALE_MINOR {Boy}
    FEMALE_MINOR {Girl}
    TRANSGENDER_MINOR {Transgender}
    other {Unknown}
  }`,
  'user.natreg.maritalStatus': 'Marital status',
  'user.natreg.maritalStatusValue': `{
    maritalStatus,
    select,
    MARRIED {Married}
    UNMARRIED {Unmarried}
    WIDOWED {Widowed}
    SEPARATED {Separated}
    DIVORCED {Divorced}
    MARRIED_LIVING_SEPARATELY {Married}
    MARRIED_TO_FOREIGN_LAW_PERSON {Married}
    FOREIGN_RESIDENCE_MARRIED_TO_UNREGISTERED_PERSON {Married}
    ICELANDIC_RESIDENCE_MARRIED_TO_UNREGISTERED_PERSON {Married}
    other {Unknown}
  }`,
  'user.natreg.citizenship': 'Citizenship',
  'user.natreg.religion': 'Religion',
  'user.natreg.settingsButton': 'Go to settings',

  // Home
  'home.screenTitle': 'Overview',
  'home.applicationsStatus': 'Applications',
  'home.allApplications': 'Digital applications',
  'home.welcomeText': 'Hi',
  'home.goodDay': 'Good day,',
  'home.onboardingModule.card1':
    'Now you can see information about vehicles, assets and your family in the app in addition to documents and licenses.',
  'home.onboardingModule.card2':
    'The app’s purpose is to provide faster access to your documents, applications, and other dealings with governmental institutions.',
  'home.onboardingModule.card3':
    'If you have comments or suggestions about something that is missing or that could be improved, feel free to contact us via email at',
  'home.onboardingModule.card4':
    'We encourage our users to read Digital Iceland’s privacy policy on',
  'home.vehicleModule.summary':
    'Enter mileage of electric and plug-in hybrid vehicles',
  'home.vehicleModule.button': 'My vehicles',
  'button.seeAll': 'See all',

  // home options
  'homeOptions.screenTitle': 'Home screen',
  'homeOptions.heading.title': 'Configure home screen',
  'homeOptions.heading.subtitle':
    'Here you can configure what is displayed on the home screen.',
  'homeOptions.graphic': 'Display graphic',
  'homeOptions.inbox': 'Latest in inbox',
  'homeOptions.licenses': 'Licenses',
  'homeOptions.applications': 'Applications',
  'homeOptions.vehicles': 'Vehicles',
  'homeOptions.airDiscount': 'Air discount scheme',

  // inbox
  'inbox.screenTitle': 'Inbox',
  'inbox.bottomTabText': 'Inbox',
  'inbox.searchPlaceholder': 'Search...',
  'inbox.loadingText': 'Searching...',
  'inbox.resultText': 'results',
  'inbox.singleResultText': 'result',
  'inbox.noResultText': 'No results',
  'inbox.emptyListTitle': 'There are currently no documents',
  'inbox.emptyListDescription':
    'When you receive electronic documents from the government, they will appear here.',

  'inbox.markAllAsReadPromptTitle': 'Do you want to mark all as read?',
  'inbox.markAllAsReadPromptDescription': 'This action cannot be undone',
  'inbox.markAllAsReadPromptCancel': 'Cancel',
  'inbox.markAllAsReadPromptConfirm': 'Mark all as read',
  'inbox.cardNoInboxDocuments':
    'When you receive mail in your mailbox, it will appear here.',

  // inbox filters
  'inboxFilters.screenTitle': 'Filter documents',
  'inboxFilters.unreadOnly': 'Show only unread',
  'inboxFilters.starred': 'Starred',
  'inboxFilters.archived': 'Archived',
  'inbox.filterButtonTitle': 'Filter',
  'inbox.filterOpenedTagTitle': 'Unread',
  'inbox.filterArchivedTagTitle': 'Archived',
  'inbox.filterStarredTagTitle': 'Starred',
  'inbox.filterOrganizationTitle': 'Organization',
  'inbox.filterCategoryTitle': 'Category',
  'inbox.filterDatesTitle': 'Dates',
  'inbox.filterClearButton': 'Clear',
  'inbox.filterApplyButton': 'Apply filters',
  'inbox.filterDateFromLabel': 'Date from',
  'inbox.filterDateToLabel': 'Date to',
  'inbox.filterDatePlaceholder': 'Choose a date',
  'inbox.filterDateConfirm': 'Confirm',
  'inbox.filterDateCancel': 'Cancel',

  // document detail
  'documentDetail.screenTitle': 'Document',
  'documentDetail.loadingText': 'Loading document',
  'documentDetail.errorUnknown': 'Error occurred while loading document',

  // wallet
  'wallet.screenTitle': 'Wallet',
  'wallet.bottomTabText': 'Wallet',
  'wallet.alertMessage':
    'To use certificates as valid credentials, you need to transfer them to Apple Wallet.',
  'wallet.emptyListTitle': 'There are currently no documents',
  'wallet.emptyListDescription':
    'When you get e.g. driving licenses, firearms licenses or fishing licenses from the government, they appear here.',

  // wallet pass
  'walletPass.screenTitle': 'Pass',
  'walletPass.lastUpdate': 'Last updated',
  'walletPass.expirationDate': 'Expiration date',
  'walletPass.errorTitle': 'Error',
  'walletPass.errorNotPossibleToAddDriverLicense':
    'At the moment it is not possible to add driving licenses to the phone.',
  'walletPass.moreInfo': 'More information',
  'walletPass.alertClose': 'Cancel',

  // wallet passport
  'walletPassport.screenTitle': 'Passport',
  'walletPassport.infoTitle': 'Remember the passport!',
  'walletPassport.infoDescription':
    'This summary is not valid as a travel document.',
  'walletPassport.warningTitle': 'Expires within 6 months',
  'walletPassport.warningDescription':
    'Note that your passport will expire within the next 6 months.',
  'walletPassport.displayName': 'Name',
  'walletPassport.number': 'Number',
  'walletPassport.issuingDate': 'Date issued',
  'walletPassport.expirationDate': 'Expiration date',
  'walletPassport.mrzName': 'Machine-readable name',
  'walletPassport.children': 'Childrens passport',
  'walletPassport.noPassport': 'No passport.',
  'walletPassport.noPassportLink': 'Read more at island.is/vegabref',

  // license scanner
  'licenseScanner.title': 'Scan barcode',
  'licenseScanner.helperMessage': 'Point device at barcode',
  'licenseScanner.awaitingPermission': 'Asking for camera permissions',
  'licenseScanner.noCameraAccess': 'Camera not available',
  'licenseScanner.errorUnknown': 'Unknown error',
  'licenseScanner.invalidBarcode': 'Invalid barcode',
  'licenseScanner.errorNetwork': 'Network error',
  'licenseScannerDetail.driverLicenseNumber': 'Driver license number',
  'licenseScannerResult.androidHelp':
    'Press button below the license to get updated barcode.',
  'licenseScannerResult.iosHelp':
    'Press three-dot button below the license. Next, refresh the screen by pulling down from the center to update the barcode.',

  // license scan detail
  'licenseScanDetail.errorCodeMessage': `{
    errorCode,
    select,
    1 {License OK}
    2 {License barcode expired, Try to refresh the barcode and scan again}
    3 {No license info found}
    4 {Request contains some field errors}
    other {Unknown error}
  }`,
  'licenseScanDetail.errorTryToRefresh':
    'Failed to validate driving license. Try to refresh the barcode and scan again.',
  'licenseScanDetail.barcodeExpired':
    'License barcode expired. Try to refresh the barcode and scan again.',

  // license scan results
  'licenseScannerResult.loading': 'Loading data',
  'licenseScannerResult.error': 'Error in scanning',
  'licenseScannerResult.valid': 'Is valid',
  'licenseScannerResult.driverLicenseTitle': 'Driver license (IS)',
  'licenseScannerResult.firarmsLicenseTitle': 'Firearms license (IS)',
  'licenseScannerResult.adrLicenseTitle': 'ADR licens (IS)',
  'licenseScannerResult.vvrLicenseTitle': 'Vinnuvélaskírteini (IS)',
  'licenseScannerResult.errorMessage': 'Error message',
  'licenseScannerResult.name': 'Name',
  'licenseScannerResult.nationalId': 'National ID',
  'licenseScannerResult.birthDate': 'Birthdate',
  'licenseScannerResult.driverLicenseNumber': 'Driver license number',

  // license details
  'licenseDetail.pcard.alert.title': 'Remember the parking card!',
  'licenseDetail.pcard.alert.description':
    'This summary is not valid as a parking card.',
  'licenseDetail.ehic.alert.title': 'Remember the card!',
  'licenseDetail.ehic.alert.description':
    'This summary is not valid as a European Health Insurance card.',

  // notifications
  'notifications.screenTitle': 'Notifications',
  'notifications.markAllAsRead': 'Mark all as read',
  'notifications.settings': 'My settings',
  'notifications.errorUnknown': 'Error occurred while loading notifications',
  'notifications.emptyListTitle': 'No notifications',
  'notifications.emptyListDescription':
    'When you receive notifications, they will appear here.',

  // profile
  'profile.screenTitle': 'More',
  'profile.bottomTabText': 'More',
  'profile.seeInfo': 'See info',
  'profile.family': 'Family',
  'profile.vehicles': 'Vehicles',
  'profile.assets': 'Assets',
  'profile.finance': 'Finance',
  'profile.airDiscount': 'Air discount scheme',

  // vehicles
  'vehicles.screenTitle': 'Vehicles',
  'vehicles.emptyListTitle': 'No vehicles found for the user',
  'vehicles.emptyListDescription':
    'Vehicles registered to you will appear here.',
  'vehicles.nextInspectionLabel': 'Next inspection {date}',
  'vehicles.mileageRequired': 'Kilometre fee',

  // vehicles detail
  'vehicleDetail.regno': 'Registration number',
  'vehicleDetail.permno': 'Permanent number',
  'vehicleDetail.firstReg': 'First registration',
  'vehicleDetail.nextInspectionDate': 'Next main inspection',
  'vehicleDetail.color': 'Color',
  'vehicleDetail.insured': 'Insured',
  'vehicleDetail.insuredValue': `{
    isInsured,
    select,
    true {Yes}
    false {No}
    other {Unknown}
  }`,
  'vehicleDetail.unpaidVehicleFee': 'Unpaid vehicle tax',
  'vehicleDetail.trailerWithBrakes':
    'Permissible maximum towable mass of trailer (braked)',
  'vehicleDetail.trailerWithoutBrakes':
    'Permissible maximum towable mass of trailer (unbraked)',
  'vehicleDetail.nedc': 'Exhaust emissions value (NEDC)',
  'vehicleDetail.vehicleWeight': 'Vehicle weight',
  'vehicleDetail.totalWeight': 'Maximum weight',
  'vehicleDetail.capacityWeight': 'Road train weight',
  'vehicleDetail.odometer': 'Odometer',
  'vehicleDetail.noInfo': 'No information received',

  // vehicle mileage
  'vehicle.mileage.errorTitle': 'Error',
  'vehicle.mileage.errorMileageInputTooLow': 'Mileage input too low',
  'vehicle.mileage.errorMileageInputTooHigh': 'Mileage input too high',
  'vehicle.mileage.errorFailedToUpdate':
    'Update mileage seems to have failed. Please try again later.',
  'vehicle.mileage.successTitle': 'Mileage updated',
  'vehicle.mileage.successMessage': 'Mileage has been updated',
  'vehicle.mileage.promptEditTitle': 'Edit mileage',
  'vehicle.mileage.promptEditButton': 'Edit',
  'vehicle.mileage.promptCancelButton': 'Cancel',
  'vehicle.mileage.inputPlaceholder': 'Enter current mileage',
  'vehicle.mileage.inputLabel': 'Mileage',
  'vehicle.mileage.inputSubmitButton': 'Submit',
  'vehicle.mileage.registerIntervalCopy':
    'Mileage can only be recorded once every 30 days',
  'vehicle.mileage.youAreNotAllowedCopy':
    'Only the main owner or custodian of an credit institution owned vehicle can record the mileage status',
  'vehicle.mileage.moreInformationCopy': 'See more information at Ísland.is',
  'vehicle.mileage.historyTitle': 'Mileage history',
  'vehicle.mileage.editRecordButton': 'Edit mileage',

  // assets overview
  'assetsOvervies.screenTitle': 'Assets',
  'assetsOverview.emptyListTitle': 'No assets found for the user',
  'assetsOverview.emptyListDescription':
    'Assets registered to you will appear here.',

  // assets details
  'assetsDetail.propertyNumber': 'Property number',
  'assetsDetail.displaySize': 'Size',
  'assetsDetail.activeAppraisal': 'Property appraisal {activeYear}',
  'assetsDetail.plannedAppraisal': 'Property appraisal {plannedYear}',
  'assetsDetail.explanation': 'Explanation',
  'assetsDetail.marking': 'Marking',
  'assetsDetail.municipality': 'Municipality',
  'assetsDetail.postNumber': 'Post number',
  'assetsDetail.buildYearDisplay': 'Build Year Display',

  // finance
  'finance.screenTitle': 'Finance',
  'finance.statusCard.status': 'Status',
  'finance.statusCard.paymentBase': 'Payment base',
  'finance.statusCard.deadline': 'Final due date',
  'finance.statusCard.amount': 'Amount',
  'finance.statusCard.total': 'Total',
  'finance.statusCard.organization': 'Contact information',
  'finance.statusCard.organizationWebsite': 'Website',
  'finance.statusCard.organizationEmail': 'Email',
  'finance.statusCard.organizationPhone': 'Phone',
  'finance.statusCard.schedulePaymentPlan': 'Make a payment schedule',
  'finance.heading.title': 'Financial standing with the government',
  'finance.heading.subtitle':
    'Here you can see an overview of your debt and/or credit balance with the government.',

  // finance detail
  'financeDetail.title': 'Detailed information',
  'financeDetail.paymentBase': 'Payment Base',
  'financeDetail.yearAndPeriod': `Year and period`,
  'financeDetail.dueDate': 'Due Date',
  'financeDetail.finalDueDate': 'Final due date',
  'financeDetail.principal': 'Principal',
  'financeDetail.interest': 'Interest',
  'financeDetail.costs': 'Costs',
  'financeDetail.payments': 'Payments',
  'financeDetail.status': 'Status',

  // family
  'family.screenTitle': 'Family',
  'family.emptyListTitle': 'Family information',
  'family.emptyListDescription':
    'Information about your family from the National Registry will appear here.',

  // family details
  'familyDetail.title': 'Info',
  'familyDetail.description': 'Here below are details about a family member',
  'familyDetail.natreg.displayName': 'Full name',
  'familyDetail.natreg.nationalId': 'Social ID',
  'familyDetail.natreg.familyRelation': 'Family Relation',
  'familyDetail.natreg.familyRelationValue': `{
    type,
    select,
    spouse {Spouse}
    child {Child}
    other {Óupplýst}
  }`,
  'familyDetail.natreg.citizenship': 'Citizenship',
  'familyDetail.natreg.birthPlace': 'Birthplace',
  'familyDetail.natreg.legalResidence': 'Legal domicile',
  'familyDetail.natreg.gender': 'Gender',

  // applications screen
  'applications.title': 'Applications',
  'applications.bottomTabText': 'Applications',
  'applications.searchPlaceholder': 'Search...',
  'applications.loadingText': 'Searching...',
  'applications.resultText': 'results',
  'applications.singleResultText': 'result',
  'applications.noResultText': 'No results',
  'applications.emptyListTitle': 'There are currently no links',
  'applications.emptyListDescription':
    'There are no links available at the moment',

  // cards
  'applicationStatusCard.openButtonLabel': 'Open application',
  'applicationStatusCard.seeMoreApplications': 'View applications',
  'applicationStatusCard.status': `{
    state,
    select,
    inprogress {In progress}
    completed {Completed}
    rejected {Rejected}
    other {Unknown status}
  }`,
  'applicationStatusCard.noActiveApplications': 'No active applications',

  // edit phone
  'edit.phone.screenTitle': 'Edit Phone',
  'edit.phone.description': 'Here you can change your phone number',
  'edit.phone.inputlabel': 'Phone number',
  'edit.phone.button': 'Save',
  'edit.phone.button.empty': 'Save empty',
  'edit.phone.error': 'Error',
  'edit.phone.errorMessage': 'Could not send verification code',

  // edit email
  'edit.email.screenTitle': 'Edit Email',
  'edit.email.description': 'Here you can change your email',
  'edit.email.inputlabel': 'Email',
  'edit.email.button': 'Save',
  'edit.email.button.empty': 'Save empty',
  'edit.email.error': 'Error',
  'edit.email.errorMessage': 'Could not send verification code',

  // edit bank info
  'edit.bankinfo.screenTitle': 'Edit Bank Info',
  'edit.bankinfo.description':
    'Here you can make changes to the bank account that you want the National Administration of Finance to use for reimbursement',
  'edit.bankinfo.inputlabel.bank': 'Bank',
  'edit.bankinfo.inputlabel.book': 'Hb.',
  'edit.bankinfo.inputlabel.number': 'Account number',
  'edit.bankinfo.button': 'Save',
  'edit.bankinfo.error': 'Error',
  'edit.bankinfo.errorMessage': 'Could not save bank info',

  // edit confirm
  'edit.confirm.screenTitle': 'Confirm edit',
  'edit.confirm.description': `Enter the security code that has been sent to {
    type,
    select,
    email {the email you have registered}
    phone {the phone number you have registered}
    other {to you}
  }.`,
  'edit.confirm.inputlabel': 'Security number',
  'edit.cancel.button': 'Cancel',
  'edit.confirm.button': 'Confirm',
  'edit.confirm.error': 'Error',
  'edit.confirm.errorMessage': 'Could not update information',

  // air discount
  'airDiscount.screenTitle': 'Air discount scheme',
  'airDiscount.headingTitle': 'Lower airfares with Air Discount Scheme',
  'airDiscount.headingSubtitle':
    'Each individual is entitled to lower fares on up to three round trips to and from Reykjavík per year (six flights). By using the Loftbrú discount you are acknowledging that you have read the Air Discount scheme terms and conditions.',
  'airDiscount.tosLinkText': 'Terms and conditions',
  'airDiscount.alertTitle': 'Attention',
  'airDiscount.alertDescription':
    'Code gets renewed after 1 usage\n(expires in 24 hours)',
  'airDiscount.myRights': 'My benefits',
  'airDiscount.remainingFares': 'Remaining fares {remaining} of {total}',
  'airDiscount.copyDiscountCode': 'Copy code',
  'airDiscount.bulletPointDiscount':
    'Each discount amounts to 40% of the airfare.',
  'airDiscount.bulletPointUsage':
    "Code enables a discount when booking on airline's booking engine.",
  'airDiscount.activeConnectionCodes': 'Active codes for connecting flights',
  'airDiscount.flight': 'Flight path: {flight}',
  'airDiscount.validTo': 'Valid to: {date} {time}',
  'airDiscount.airfaresUsage': 'Usage in the current season',
  'airDiscount.emptyListTitle': 'No benefits',
  'airDiscount.emptyListDescription':
    'Only inhabitants with a legal domicile in rural areas far away from the Capital area and on islands are eligible for a discount with Loftbru. (see map on loftbru.is)',

  // offline
  'offline.title': 'No internet connection',
  'offline.message': 'Information has not been updated.',

  // problem
  'problem.error.tag': 'Error',
  'problem.error.title': 'Service is temporarily down',
  'problem.error.message': 'Please try again later',
  'problem.noData.title': 'No data',
  'problem.noData.message':
    'If you believe you have data that should appear here, please contact service provider.',
  'problem.offline.title': 'No internet connection',
  'problem.offline.message':
    'An error occurred while communicating with the service provider',

  // passkeys
  'passkeys.headingTitle': 'Sign in with Island.is app',
  'passkeys.openUrlHeadingSubtitle':
    'You are opening Island.is in a browser. Do you want to create a passkey to sign in automatically with the app?',
  'passkeys.headingSubtitle':
    'Do you want to create a passkey to sign in automatically with the app?',
  'passkeys.createButton': 'Create a passkey',
  'passkeys.skipButton': 'Skip',
  'passkeys.errorRegistering': 'Error',
  'passkeys.errorRegisteringMessage': 'Could not create a passkey',
}
