import prisma from "@/prisma/client";
import { Flex, Table } from "@radix-ui/themes";

import { IssueStatusBadge } from "@/app/components/index";

import IssueActions from "./IssueActions";
import { Issue, Prisma, Status } from "@prisma/client";

import NextLink from "next/link";
import { ArrowUpIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import Pagination from "@/app/components/Pagination";
import { Metadata } from "next";

interface Props {
  searchParams: {
    status: string;
    orderBy: keyof Issue;
    page: string;
  };
}

const IssuesPage = async ({ searchParams }: Props) => {
  const columns: {
    label: string;
    value: keyof Issue;
    className?: string;
  }[] = [
    { label: "Issue", value: "title" },
    { label: "Status", value: "status", className: "hidden md:table-cell" },
    { label: "Created", value: "createdAt", className: "hidden md:table-cell" },
  ];

  const statuses = Object.values(Status) as string[];
  const status = statuses.includes(searchParams.status)
    ? (searchParams.status as Status)
    : undefined;

  // Ensure orderBy is a valid field of Issue
  const validOrderByFields = columns.map((column) => column.value);
  const orderByField = validOrderByFields.includes(searchParams.orderBy)
    ? searchParams.orderBy
    : "createdAt"; // Default to a valid field if undefined
  
    const where = { status }

  const page = parseInt(searchParams.page) || 1;
  const pageSize = 10;
  let issues;
  if (searchParams.status === "All") {
    issues = await prisma.issue.findMany({
      orderBy: {
        [orderByField]: "asc",
      },
    });
  } else {
    issues = await prisma.issue.findMany({
      where,
      orderBy: {
        [orderByField]: "asc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  const issueCount = await prisma.issue.count({ where });

  return (
    <Flex direction="column" gap="3">

      <IssueActions />

      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            {columns.map((column) => (
              <Table.ColumnHeaderCell
                key={column.value}
                className={column.className}
              >
                <NextLink
                  href={{
                    query: { ...searchParams, orderBy: column.value },
                  }}
                >
                  {column.label}
                </NextLink>
                {column.value === orderByField && (
                  <ArrowUpIcon className="inline" />
                )}
              </Table.ColumnHeaderCell>
            ))}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {issues.map((issue) => (
            <Table.Row key={issue.id}>
              <Table.Cell>
                <Link href={`/issues/${issue.id}`}>{issue.title}</Link>
                <div className="block md:hidden">
                  <IssueStatusBadge status={issue.status} />
                </div>
              </Table.Cell>
              <Table.Cell className="hidden md:table-cell">
                <IssueStatusBadge status={issue.status} />
              </Table.Cell>
              <Table.Cell className="hidden md:table-cell">
                {issue.createdAt.toDateString()}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Pagination 
        pageSize={pageSize}
        currentPage={page}
        itemCount={issueCount}
      />
    </Flex>
  );
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Issue Tracker - Issue List',
  description: 'View all project issues'
}

export default IssuesPage;
