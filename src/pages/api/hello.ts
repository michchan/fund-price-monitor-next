// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { StatusCodes } from 'http-status-codes'

export default (req: NextApiRequest, res: NextApiResponse): void => {
  res.status(StatusCodes.OK).json({ name: 'John Doe' })
}