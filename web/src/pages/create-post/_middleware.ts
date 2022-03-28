import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  if (!req.cookies.qid) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  else {
    return NextResponse.next()
  }
}