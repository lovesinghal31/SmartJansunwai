import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { User, MapPin, Lock, Globe, Bell, FileText, Star, Download, Trash2 } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Column 1 */}
        <div className="space-y-8">
          {/* Personal Information */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <User className="w-5 h-5 text-primary-600" />
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" placeholder="Enter your name" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="profilePhoto">Profile Photo</Label>
                <Input id="profilePhoto" type="file" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="gender">Gender</Label>
                  <Select>
                    <SelectTrigger id="gender"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Login & Security */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Lock className="w-5 h-5 text-primary-600" />
              <CardTitle>Login & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">Change Password</Button>
              <Button variant="outline" className="w-full justify-start">Enable 2FA</Button>
              <Button variant="outline" className="w-full justify-start">Manage Linked Accounts</Button>
            </CardContent>
          </Card>

          {/* Submissions & Feedback */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <FileText className="w-5 h-5 text-primary-600" />
              <CardTitle>My Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">View All Complaints</Button>
              <Button variant="outline" className="w-full justify-start">View Feedback History</Button>
            </CardContent>
          </Card>
        </div>

        {/* Column 2 */}
        <div className="space-y-8">
          {/* Contact Details */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <MapPin className="w-5 h-5 text-primary-600" />
              <CardTitle>Contact & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-1">
                <Label>Mobile Number (Verified)</Label>
                <Input readOnly value="+91 9876543210" />
              </div>
              <div className="space-y-1">
                <Label>Email ID (Verified)</Label>
                <Input type="email" readOnly value="example@email.com" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="address">Current Address</Label>
                <Input id="address" placeholder="Enter your address" />
              </div>
            </CardContent>
          </Card>
          
          {/* Notification Settings */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Bell className="w-5 h-5 text-primary-600" />
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-2 rounded-lg border">
                <Label htmlFor="sms-alerts">SMS Alerts</Label>
                <Switch id="sms-alerts" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg border">
                <Label htmlFor="email-alerts">Email Alerts</Label>
                <Switch id="email-alerts" defaultChecked />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg border">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <Switch id="push-notifications" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-500">
            <CardHeader className="flex flex-row items-center gap-3">
              <Trash2 className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button variant="destructive" className="w-full">Request Account Deletion</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
