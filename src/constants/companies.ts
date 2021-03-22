const companies = {
  AIA: 'aia',
  MANULIFE: 'manulife',
} as const

export type Companies = typeof companies
export type Company = Companies[keyof Companies]

export const companyList = Object.values(companies)

export default companies