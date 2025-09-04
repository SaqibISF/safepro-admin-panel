import React, { FC } from "react";
import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import data from "./data.json";
import Section from "@/components/Section";

const Home: FC = () => (
  <Section heading="Dashboard">
    <SectionCards />

    <ChartAreaInteractive />

    <DataTable data={data} />
  </Section>
);

export default Home;
