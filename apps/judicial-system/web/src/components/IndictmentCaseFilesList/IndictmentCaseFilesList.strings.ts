import { defineMessages } from 'react-intl'

export const strings = defineMessages({
  title: {
    id: 'judicial.system.core:indictment_case_files_list.title',
    defaultMessage: 'Skjöl málsins',
    description: 'Notaður sem titill á skjölum málsins í ákærum.',
  },
  caseFileTitle: {
    id: 'judicial.system.indictments:indictment_case_files_list.case_file_title',
    defaultMessage: 'Gagnapakkar',
    description: 'Titill á Gagnapakkar hluta á dómskjalaskjá í ákærum.',
  },
  caseFileButtonText: {
    id: 'judicial.system.indictments:indictment_case_files_list.case_file_button_text',
    defaultMessage: 'Skjalaskrá {policeCaseNumber}.pdf',
    description:
      'Notaður sem texti á PDF takka til að sækja gagnapakka í ákærum.',
  },
  rulingAndCourtRecordsTitle: {
    id: 'judicial.system.core:court.indictment_case_files_list.ruling_court_record_titles',
    defaultMessage: 'Dómar, úrskurðir og þingbók',
    description: 'Notaður sem titill á dómur hluta á dómskjalaskjá í ákærum.',
  },
  uploadedCaseFiles: {
    id: 'judicial.system.core:court.indictment_case_files_list.uploaded_case_files',
    defaultMessage: 'Innsend gögn',
    description:
      'Notaður sem titill á innsend gögn hluta á dómskjalaskjá í ákærum.',
  },
})
