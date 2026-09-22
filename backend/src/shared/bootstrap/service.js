import { bootstrapRepository } from './repository.js';

export const bootstrapService = {
  async getBootstrapData(year) {
    const tags = await bootstrapRepository.getActiveTags();
    const bdms = await bootstrapRepository.getActiveBDMs();
    const holidays = await bootstrapRepository.getHolidays(year);

    const metadata = {
      lead_statuses: [
        { key: 'new', label: 'New Lead' },
        { key: 'assigned', label: 'Assigned' },
        { key: 'contacted', label: 'Contacted' },
        { key: 'in_pipeline', label: 'In Pipeline' },
        { key: 'follow_up', label: 'Follow-Up' },
        { key: 'closed_won', label: 'Closed Won' },
        { key: 'closed_lost', label: 'Closed Lost' }
      ],
      lead_sources: [
        { key: 'meta_ads', label: 'Meta Ads' },
        { key: 'google_ads', label: 'Google Ads' },
        { key: 'website', label: 'Website' },
        { key: 'referral', label: 'Referral' },
        { key: 'cold_outreach', label: 'Cold Outreach' },
        { key: 'event', label: 'Event' },
        { key: 'other', label: 'Other' }
      ],
      call_outcomes: [
        { key: 'connected', label: 'Connected' },
        { key: 'busy', label: 'Busy' },
        { key: 'not_reachable', label: 'Not Reachable' },
        { key: 'switched_off', label: 'Switched Off' },
        { key: 'invalid_number', label: 'Invalid Number' },
        { key: 'callback_requested', label: 'Callback Requested' },
        { key: 'interested', label: 'Interested' },
        { key: 'not_interested', label: 'Not Interested' }
      ],
      bpf_stages: [
        { key: 'lead_captured', label: 'Lead Captured', order: 1 },
        { key: 'contact_established', label: 'Contact Established', order: 2 },
        { key: 'discovery_call', label: 'Discovery Call', order: 3 },
        { key: 'brd_finalized', label: 'BRD Finalized', order: 4 },
        { key: 'proposal_sent', label: 'Proposal Sent', order: 5 },
        { key: 'negotiation', label: 'Negotiation', order: 6 },
        { key: 'deal_closed', label: 'Deal Closed', order: 7 }
      ]
    };

    return {
      tags,
      bdms,
      holidays,
      metadata
    };
  }
};
