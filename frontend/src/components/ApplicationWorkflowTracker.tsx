import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, FileText } from 'lucide-react';

interface HistoryRow {
  approval_id: string;
  action_by_name: string;
  action_by_role: string;
  action: string;
  from_stage: string;
  to_stage: string;
  remarks: string | null;
  action_date: string;
}

interface ApplicationWorkflowTrackerProps {
  currentStage: string;
  status: string;
  applicationDate: string | null;
  history?: HistoryRow[];
}

export const STAGES = [
  { id: 'ADMIN_VERIFICATION', label: 'Admin Verification', authority: 'Admin' },
  { id: 'DISTRICT_SP_APPROVAL', label: 'SP Approval', authority: 'District SP' },
  { id: 'SP_UPPCC_APPROVAL', label: 'SP UPPCC / UPPTS Approval', authority: 'SP UPPCC / UPPTS' },
  { id: 'IG_TS_APPROVAL', label: 'IG TS Approval', authority: 'IG Tech Services' },
  { id: 'HQ_REVIEW', label: 'Headquarters Review', authority: 'HQ Reviewer' },
  { id: 'FINAL_APPROVAL', label: 'Final Decision', authority: 'ADG Tech Services' }
];

export const ApplicationWorkflowTracker: React.FC<ApplicationWorkflowTrackerProps> = ({ currentStage, status, applicationDate, history = [] }) => {
  // Determine if a step is completed, current, or pending
  const getStepStatus = (stepId: string, index: number) => {
    if (status === 'REJECTED' && currentStage === stepId) return 'REJECTED';
    if (status === 'RETURNED' && currentStage === stepId) return 'RETURNED';
    if (status === 'APPROVED') return 'APPROVED';

    const currentIndex = STAGES.findIndex(s => s.id === currentStage);
    
    if (currentStage === 'DRAFT') return 'WAITING';
    
    if (index < currentIndex) return 'APPROVED';
    if (index === currentIndex) return 'PENDING';
    return 'WAITING';
  };

  const getHistoryForStage = (stageId: string) => {
    // Find the latest action taken BY this stage
    const logs = history.filter(h => h.from_stage === stageId).sort((a, b) => new Date(b.action_date).getTime() - new Date(a.action_date).getTime());
    return logs.length > 0 ? logs[0] : null;
  };

  const getSubmitHistory = () => {
    const submitLogs = history.filter(h => h.action === 'SUBMIT').sort((a, b) => new Date(b.action_date).getTime() - new Date(a.action_date).getTime());
    return submitLogs.length > 0 ? submitLogs[0] : null;
  };

  const submitLog = getSubmitHistory();
  const sortedHistory = [...history].sort((a, b) => new Date(b.action_date).getTime() - new Date(a.action_date).getTime());
  const latestRemark = sortedHistory.length > 0 && sortedHistory[0].remarks ? { remark: sortedHistory[0].remarks, by: sortedHistory[0].action_by_name, role: sortedHistory[0].action_by_role } : null;

  return (
    <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Vertical Workflow Tracker */}
      <div style={{ 
        backgroundColor: 'rgba(15, 23, 42, 0.4)', 
        padding: '32px 24px', 
        borderRadius: '12px', 
        border: '1px solid var(--border-color)',
        position: 'relative',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)'
      }}>
        
        {/* Continuous Vertical Line */}
        <div style={{ 
          position: 'absolute', 
          left: '35px', 
          top: '40px', 
          bottom: '40px', 
          width: '2px', 
          backgroundColor: '#334155', 
          zIndex: 0 
        }}></div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative', zIndex: 1 }}>
          
          {/* Stage 0: Application Submitted */}
          <div style={{ display: 'flex', gap: '24px', opacity: status === 'DRAFT' ? 0.5 : 1 }}>
            <div style={{ 
              width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
              backgroundColor: status === 'DRAFT' ? '#475569' : '#10b981', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
              boxShadow: '0 0 0 4px var(--bg-panel)'
            }}>
              {status === 'DRAFT' ? <Clock size={12} /> : <CheckCircle2 size={12} />}
            </div>
            <div style={{ 
              flex: 1, 
              backgroundColor: 'rgba(255,255,255,0.03)', 
              borderRadius: '8px', 
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ color: 'white', fontWeight: 600, fontSize: '1rem', marginBottom: '8px' }}>Application Submitted</div>
                {submitLog && (
                  <>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      {new Date(submitLog.action_date).toLocaleDateString()} {new Date(submitLog.action_date).toLocaleTimeString()}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      By: <strong style={{ color: 'white' }}>{submitLog.action_by_name}</strong>
                    </div>
                  </>
                )}
                {!submitLog && applicationDate && (
                   <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      {new Date(applicationDate).toLocaleDateString()}
                   </div>
                )}
              </div>
              <div>
                {/* Status Badge */}
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  backgroundColor: status === 'DRAFT' ? 'rgba(71, 85, 105, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: status === 'DRAFT' ? '#94a3b8' : '#10b981',
                  border: `1px solid ${status === 'DRAFT' ? '#475569' : '#10b981'}`
                }}>
                  {status === 'DRAFT' ? 'Waiting' : 'Approved'}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Stages 1 to 6 */}
          {STAGES.map((stage, index) => {
            const stepStatus = getStepStatus(stage.id, index);
            const stageLog = getHistoryForStage(stage.id);
            
            let Icon = Clock;
            let dotColor = '#475569'; // Grey for waiting
            let badgeText = 'Waiting';
            let badgeBg = 'rgba(71, 85, 105, 0.2)';
            let badgeColor = '#94a3b8';
            let badgeBorder = '#475569';
            let cardBg = 'rgba(255,255,255,0.03)';
            let cardBorder = '1px solid rgba(255,255,255,0.05)';
            
            if (stepStatus === 'APPROVED') {
              Icon = CheckCircle2;
              dotColor = '#10b981'; // Green
              badgeText = 'Approved';
              badgeBg = 'rgba(16, 185, 129, 0.2)';
              badgeColor = '#10b981';
              badgeBorder = '#10b981';
            } else if (stepStatus === 'PENDING') {
              Icon = Clock;
              dotColor = '#eab308'; // Yellow
              badgeText = 'Current Stage';
              badgeBg = 'rgba(234, 179, 8, 0.2)';
              badgeColor = '#eab308';
              badgeBorder = '#eab308';
              cardBg = 'rgba(234, 179, 8, 0.05)';
              cardBorder = '1px solid #eab308'; // Yellow border
            } else if (stepStatus === 'REJECTED') {
              Icon = XCircle;
              dotColor = '#ef4444'; // Red
              badgeText = 'Rejected';
              badgeBg = 'rgba(239, 68, 68, 0.2)';
              badgeColor = '#ef4444';
              badgeBorder = '#ef4444';
              cardBg = 'rgba(239, 68, 68, 0.05)';
              cardBorder = '1px solid rgba(239, 68, 68, 0.3)';
            } else if (stepStatus === 'RETURNED') {
              Icon = AlertCircle;
              dotColor = '#f59e0b'; // Orange
              badgeText = 'Returned';
              badgeBg = 'rgba(245, 158, 11, 0.2)';
              badgeColor = '#f59e0b';
              badgeBorder = '#f59e0b';
              cardBg = 'rgba(245, 158, 11, 0.05)';
              cardBorder = '1px solid rgba(245, 158, 11, 0.3)';
            }

            return (
              <div key={stage.id} style={{ display: 'flex', gap: '24px', opacity: stepStatus === 'WAITING' ? 0.6 : 1 }}>
                
                {/* Circular Status Indicator */}
                <div style={{ 
                  width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                  backgroundColor: dotColor, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                  boxShadow: stepStatus === 'PENDING' ? `0 0 0 4px ${badgeBg}` : '0 0 0 4px var(--bg-panel)'
                }}>
                  <Icon size={12} />
                </div>
                
                {/* Stage Card */}
                <div style={{ 
                  flex: 1, 
                  backgroundColor: cardBg, 
                  borderRadius: '8px', 
                  padding: '20px',
                  border: cardBorder,
                  boxShadow: stepStatus === 'PENDING' ? '0 0 15px rgba(234, 179, 8, 0.4)' : 'none',
                  transition: 'all 0.2s ease-in-out'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ color: 'white', fontWeight: 600, fontSize: '1.05rem', marginBottom: '8px' }}>
                        {stage.label}
                      </div>

                      {/* Approved details */}
                      {stageLog && (stepStatus === 'APPROVED' || stepStatus === 'REJECTED' || stepStatus === 'RETURNED') && (
                        <>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            {new Date(stageLog.action_date).toLocaleDateString()} {new Date(stageLog.action_date).toLocaleTimeString()}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                            By: <strong style={{ color: 'white' }}>{stageLog.action_by_name}</strong>
                          </div>
                          
                          {/* Inside stage card remarks */}
                          {stageLog.remarks && (
                            <div style={{ 
                              backgroundColor: 'rgba(0,0,0,0.2)',
                              padding: '12px',
                              borderRadius: '6px',
                              borderLeft: `3px solid ${dotColor}`,
                              fontSize: '0.85rem',
                              color: 'var(--text-secondary)',
                              marginTop: '8px'
                            }}>
                              <strong style={{ color: 'white' }}>Remarks:</strong> {stageLog.remarks}
                            </div>
                          )}
                        </>
                      )}

                      {/* Authority for pending or waiting stages */}
                      {(stepStatus === 'PENDING' || stepStatus === 'WAITING') && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Current Authority:<br/>
                          <strong style={{ color: 'white', display: 'block', marginTop: '4px' }}>{stage.authority}</strong>
                        </div>
                      )}

                    </div>
                    
                    {/* 5. Status Badge on Right Side */}
                    <div>
                      <span style={{
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        backgroundColor: badgeBg,
                        color: badgeColor,
                        border: `1px solid ${badgeBorder}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        letterSpacing: '0.05em'
                      }}>
                        {badgeText}
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. Remarks Section at Bottom */}
      {latestRemark && (
        <div className="glass-panel" style={{ 
          padding: '24px', 
          borderRadius: '12px',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(255,255,255,0.1)',
          marginTop: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <FileText size={18} style={{ color: 'var(--primary)' }} />
            <h4 style={{ color: 'white', margin: 0, fontSize: '1rem', fontWeight: 600 }}>Latest Remarks</h4>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', margin: '0 0 16px 0', padding: '16px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
            "{latestRemark.remark}"
          </p>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
            Added by: <strong style={{ color: 'white' }}>{latestRemark.by}</strong> ({latestRemark.role.replace(/_/g, ' ')})
          </div>
        </div>
      )}

      {/* Legend at Bottom */}
      <div style={{ display: 'flex', gap: '20px', padding: '16px 8px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
          Green = Approved
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#eab308' }}></div>
          Yellow = Pending
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
          Red = Rejected
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
          Orange = Returned for Correction
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#475569' }}></div>
          Grey = Yet to Start
        </div>
      </div>

    </div>
  );
};
