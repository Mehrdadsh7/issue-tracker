import prisma from "@/prisma/client";
import { Table } from "@radix-ui/themes";

import { IssueStatusBadge } from "@/app/components/index";

import IssueActions from "./IssueActions";
import { Issue, Status } from "@prisma/client";

import NextLink from "next/link";
import { ArrowUpIcon } from "@radix-ui/react-icons";
import Link from "next/link";

interface Props {
  searchParams: { status: string, orderBy: keyof Issue };
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
  const validOrderByFields = columns.map(column => column.value);
  const orderByField = validOrderByFields.includes(searchParams.orderBy)
    ? searchParams.orderBy
    : "createdAt"; // Default to a valid field if undefined

  let issues;
  if (searchParams.status === "all") {
    issues = await prisma.issue.findMany({
      orderBy: {
        [orderByField]: 'asc'
      }
    });
  } else {
    issues = await prisma.issue.findMany({
      where: {
        status: status, // Ensuring proper type
      },
      orderBy: {
        [orderByField]: 'asc'
      }
    });
  }

  return (
    <div>
      <IssueActions />

      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            {columns.map(column => <Table.ColumnHeaderCell key={column.value}>
              <NextLink href={{
                query: {...searchParams, orderBy: column.value}
              }}>
              {column.label}
              </NextLink>
              {column.value === orderByField && <ArrowUpIcon className="inline" /> }
              </Table.ColumnHeaderCell> )}
            
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
    </div>
  );
};

export const dynamic = "force-dynamic";

export default IssuesPage;
