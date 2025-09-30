import React, { FC } from "react";
import Section from "@/components/Section";
import UsersSection from "@/components/sections/UsersSection";

const UsersPage: FC = async () => {
  return (
    <Section heading="Users">
      <UsersSection />
    </Section>
  );
};

export default UsersPage;
