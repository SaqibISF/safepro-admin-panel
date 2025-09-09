import React, { FC } from 'react'
import Section from '@/components/Section'
import { headers } from 'next/headers'

const UsersPage: FC = async () => {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname")
  return (
    <Section heading="Users" description={pathname}>
        
    </Section>
  )
}

export default UsersPage