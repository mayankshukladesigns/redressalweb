import React, { useState } from 'react';
import { initialPendingCards, initialResolvedCards } from './web/mockData';
import { TicketCard, ResolvedTicketCard } from './web/types';
import SupervisorView from './screens/SupervisorScreen';
import CDPOView from './screens/BeneficiaryRedressalScreen';
import DPOView from './screens/DPODashboardScreen';
import Header, { Role } from './components/Header';

export default function App() {
  const [activeRole, setActiveRole] = useState<Role>('Supervisor');
  const [pendingTickets, setPendingTickets] = useState<TicketCard[]>(() => initialPendingCards);
  const [resolvedTickets, setResolvedTickets] = useState<ResolvedTicketCard[]>(() => initialResolvedCards);

  // Accessibility Font Size Adjuster State
  const [fontSizeOffset, setFontSizeOffset] = useState<number>(0);

  return (
    <div
      className="app-container"
      style={{ fontSize: `${18 + fontSizeOffset}px` }}
    >
      <Header
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        fontSizeOffset={fontSizeOffset}
        setFontSizeOffset={setFontSizeOffset}
      />

      {/* Main Content Area */}
      <main className="dashboard-main">
        {activeRole === 'Supervisor' && (
          <SupervisorView 
            sharedPendingCards={pendingTickets}
            setSharedPendingCards={setPendingTickets}
            sharedResolvedCards={resolvedTickets}
            setSharedResolvedCards={setResolvedTickets}
          />
        )}
        {activeRole === 'CDPO' && (
          <CDPOView 
            sharedPendingCards={pendingTickets}
            setSharedPendingCards={setPendingTickets}
            sharedResolvedCards={resolvedTickets}
            setSharedResolvedCards={setResolvedTickets}
          />
        )}
        {activeRole === 'DPO' && (
          <DPOView 
            sharedPendingCards={pendingTickets}
            setSharedPendingCards={setPendingTickets}
            sharedResolvedCards={resolvedTickets}
            setSharedResolvedCards={setResolvedTickets}
          />
        )}
      </main>
    </div>
  );
}
