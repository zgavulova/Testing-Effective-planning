
'use client';

import { BriefcaseBusiness } from 'lucide-react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button'; // Ensure Button is imported if SidebarTrigger is not sufficient

export function AppHeader() {
  // const { toggleSidebar } = useSidebar(); // useSidebar can only be used if AppHeader is a child of SidebarProvider
  // SidebarTrigger component handles this internally.

  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center">
        <SidebarTrigger className="mr-3 h-7 w-7 text-primary-foreground hover:bg-primary/80 focus-visible:ring-primary-foreground" />
        <BriefcaseBusiness className="h-8 w-8 mr-3" />
        <h1 className="text-xl md:text-2xl font-bold font-headline">Effective Holiday planning</h1>
      </div>
    </header>
  );
}
