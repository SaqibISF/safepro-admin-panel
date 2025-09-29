import React, { FC } from "react";
import Section from "@/components/Section";
import UsersTable from "@/components/UsersTable";

const UsersPage: FC = async () => {
  return (
    <Section heading="Users">
      <UsersTable />
    </Section>
  );
};

export default UsersPage;
