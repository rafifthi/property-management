"use client";

import { Plus, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const rolePermissions = [
  { role: "Owner", permissions: ["Full access to all features", "Manage users & roles", "Financial reports", "Integration settings"] },
  { role: "Staff", permissions: ["Property & unit management", "Tenant & lease management", "Invoice & payment processing", "Ticket management"] },
  { role: "Vendor", permissions: ["View assigned tickets", "Update ticket status", "View work orders"] }
];

const sampleUsers = [
  { name: "Budi Prakoso", email: "budi@rumahhub.com", role: "Owner", status: "Active" },
  { name: "Siti Rahayu", email: "siti@rumahhub.com", role: "Staff", status: "Active" },
  { name: "CV Bangun Jaya", email: "bangun@example.com", role: "Vendor", status: "Active" }
];

export default function UsersSettingsPage() {
  return (
    <section className="content-grid">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield size={18} /> Role Permissions
          </CardTitle>
          <p className="text-sm text-muted-foreground">Define what each role can access and manage</p>
        </CardHeader>
        <CardContent className="grid gap-4">
          {rolePermissions.map((rp) => (
            <div key={rp.role}>
              <h4 className="text-sm font-semibold mb-2">{rp.role}</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {rp.permissions.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Team Members</CardTitle>
          <Button variant="default" size="sm"><Plus size={15} /> Invite User</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleUsers.map((u) => (
                <TableRow key={u.email}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "Owner" ? "default" : u.role === "Staff" ? "success" : "warning"}>{u.role}</Badge>
                  </TableCell>
                  <TableCell><Badge variant="success">{u.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
