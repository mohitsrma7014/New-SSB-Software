import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DepartmentPage from './pages/DepartmentPage'; 
import ITAdminPage from './pages/ITAdminPage';
import AccountsPage from './pages/AccountsPage';
import ForgingPage from './pages/ForgingPage';
import Schedule from './pages/schedule/Schedule';
import DispatchList from './pages/dispatch/DispatchList';
import DispatchForm from './pages/dispatch/DispatchForm';
import dispatch_home from './pages/dispatch/dispatch_home';
import DispatchList1 from './pages/dispatch/DispatchList1';
import HRPage from './pages/HRPage';
import Signup from './pages/Signup';
import Admin from './pages/Admin';
import ChangePassword from './pages/ChangePassword';
import Rm from './pages/Rm';
import NotFoundPage from './pages/NotFoundPage';
import AnalyticsPage from './components/AdminComponents/AnalyticsPage';  // Default import
import Htanalytics from './components/AdminComponents/Htanalytics';
import Shot_blast_production from './components/AdminComponents/Shot_blast_production';
import Pre_mc_production from './components/AdminComponents/Pre_mc_production';
import Cnc_production from './components/AdminComponents/cnc_production';
import Marking_production from './components/AdminComponents/Marking_production';
import Visual_production from './components/AdminComponents/Visual_production';
import Fi_production from './components/AdminComponents/Fi_production';
import ProductionPage from './components/AdminComponents/ProductionPage';
import Rm_reciving from './components/Rawmaterial/Rm_reciving';
import BalanceAfterHold from './components/Rawmaterial/BalanceAfterHold';
import Master_list_list1 from './components/Rawmaterial/Master_list_list';
import BlockmtForm from './components/Rawmaterial/BlockmtForm';
import BlockmtForm_dummy from './components/Rawmaterial/BlockmtForm_dummy';
import Raw_material_update from './components/Rawmaterial/Raw_material_update';
import Issu from './components/Rawmaterial/Issu';
import Issu_list from './components/Rawmaterial/Issu_list';
import Planning_updates from './components/Rawmaterial/Planning_updates';
import PlanningUpdates1 from './components/Rawmaterial/Planning_updates1';
import Single from './components/Add/Single';
import Cnc_planning from './components/Add/Cnc_planning';
import './index.css';
import Rating from './pages/schedule/Rating';
import Rm_schedule from './pages/Rm_schedule/Ratingmain';
import ScheduleForm from './pages/schedule/ScheduleForm';
import TraceabilityCard from './pages/Tracibility/TraceabilityCard';
import TraceabilityCard2 from './pages/Tracibility/TraceabilityCard2';
import ForgingList from './components/Forging/ForgingList';
import BulkAddForm from './pages/Forging/BulkAddForm';
import ForgingAnalyticsPage from './pages/Forging/AnalyticsPage';
import Forging_home from './pages/Forging/Forging_home';
import BatchTrackingTable1 from './pages/Forging/BatchTrackingTable';

import Pre_mc_production1 from './pages/Pre_mc/Pre_mc_production';
import Pre_mc_home from './pages/Pre_mc/Pre_mc_home';
import Pre_mclist from './pages/Pre_mc/Pre_mclist';
import Pre_mc_form from './pages/Pre_mc/Pre_mc_form';
import BatchTrackingTable2 from './pages/Pre_mc/BatchTrackingTable';

import Quality_home from './pages/Quality/Quality_home';

import Heattreatment_home from './pages/Heattreatment/Heattreatment_home';
import Htanalytics1 from './pages/Heattreatment/Htanalytics';
import Ht_list from './pages/Heattreatment/Ht_list';
import BatchTrackingTable3 from './pages/Heattreatment/BatchTrackingTable';
import BulkAddFormheattreatment from './pages/Heattreatment/BulkAddFormheattreatment';

import Shot_blast_production1 from './pages/Shot_blast/Shot_blast_production';
import Shot_blast_home from './pages/Shot_blast/Shot_blast_home';
import Shot_blastlist from './pages/Shot_blast/Shot_blastlist';
import Shot_blast_form from './pages/Shot_blast/Shot_blast_form';
import BatchTrackingTable4 from './pages/Shot_blast/BatchTrackingTable';

import Forgingrejection from './pages/rejection/Forging';

import Cnc_home from './pages/Cnc/Cnc_home';
import Cnc_production1 from './pages/Cnc/cnc_production';
import Cnc_list from './pages/Cnc/Cnc_list';
import BulkAddFormcnc from './pages/Cnc/BulkAddFormcnc';
import CncPlanningForm from './pages/Cnc/CncPlanningForm';
import CncPlanningList from './pages/Cnc/CncPlanningList';
import BatchTrackingTable5 from './pages/Cnc/BatchTrackingTable';
import LineMaster from './pages/Cnc/LineMaster';


import CustomerComplaint from './pages/Costumer_complaints/CustomerComplaint';
import CustomerComplaint1 from './pages/Quality/CustomerComplaint';


import Fi_home from './pages/Fi/Fi_home';
import Fi_production1 from './pages/Fi/Fi_production';
import Fi_list from './pages/Fi/Fi_list';
import BulkAddFormfi from './pages/Fi/BulkAddFormfi';
import BatchTrackingTable6 from './pages/Fi/BatchTrackingTable';

import Marking_home from './pages/Marking/Marking_home';
import Marking_production1 from './pages/Marking/Marking_production';
import Marking_list from './pages/Marking/Marking_list';
import Marking_form from './pages/Marking/marking_form';
import BatchTrackingTable7 from './pages/Marking/BatchTrackingTable';

import Visual_home from './pages/Visual/Visual_home';
import Visual_production1 from './pages/Visual/Visual_production';
import Visual_list from './pages/Visual/Visual_list';
import BulkAddFormvisual from './pages/Visual/BulkAddFormvisual';
import BatchTrackingTable8 from './pages/Visual/BatchTrackingTable';

import Master_list_list from './pages/Master_list/Master_list_list';
import Master_list_listqa from './pages/Master_list/Master_list_listqa';
import Master_list_list2 from './pages/Cnc/Master_list_list1';
import Master_list_list3 from './pages/dispatch/Master_list_list1';
import BatchTrackingTable9 from './pages/dispatch/BatchTrackingTable';

import Calibration from './pages/Calibration/Calibration';
import Calibrationqa from './pages/Calibration/Calibrationqa';
import UIDGenerator from './pages/Calibration/UIDGenerator';

import CalibrationRejected from './pages/Calibration/CalibrationRejected';
import Pdfextrection from './pages/Others/Pdfextrection';
import Ratingmain from './pages/Rating/Ratingmain';
import InventoryStatus from './pages/Inventory/InventoryStatus';

const App = () => {
  const isAuthenticated = () => !!localStorage.getItem('accessToken'); // Check if access token exists
  const departmentComponents = {
    rm: Rm,
    it: ITAdminPage,
    accounts: AccountsPage,
    admin: Admin,
    forging: Forging_home,
    pre_mc: Pre_mc_home,
    ht: Heattreatment_home,
    shot_blast: Shot_blast_home,
    cnc: Cnc_home,
    fi: Fi_home,
    marking: Marking_home,
    visual: Visual_home,
    dispatch: dispatch_home,
    qa: Quality_home,
  };
  
  // Check for token validity in localStorage
  const isTokenValid = () => {
    const token = localStorage.getItem('accessToken');
    // Implement logic here to verify if the token is expired
    if (token) {
      const tokenExpDate = JSON.parse(atob(token.split('.')[1])).exp; // Decode JWT token to get expiration time
      if (tokenExpDate < Date.now() / 1000) {
        localStorage.removeItem('accessToken'); // Remove expired token
        return false;
      }
      return true;
    }
    return false;
  };

  const DepartmentRouter = () => {
    const { departmentName } = useParams();
    const DepartmentComponent = departmentComponents[departmentName.toLowerCase()] || NotFoundPage;

    return isTokenValid() ? <DepartmentComponent /> : <Navigate to="/login" replace />;
  };

  return (
    <Routes>
      <Route path="/department" element={isTokenValid() ? <Navigate to="/home" replace /> : <LoginPage />} />
      <Route path="/" element={<LoginPage />} />
      <Route path="/department/:departmentName" element={<DepartmentRouter />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/ProductionPage" element={<ProductionPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/Htanalytics" element={<Htanalytics />} />
      <Route path="/Shot_blast_production" element={<Shot_blast_production />} />
      <Route path="/Pre_mc_production" element={<Pre_mc_production />} />
      <Route path="/Cnc_production" element={<Cnc_production />} />
      <Route path="/Marking_production" element={<Marking_production />} />
      <Route path="/Fi_production" element={<Fi_production />} />
      <Route path="/Visual_production" element={<Visual_production />} />
      <Route path="/Rm_reciving" element={<Rm_reciving />} />
      <Route path="/BalanceAfterHold" element={<BalanceAfterHold />} />
      <Route path="/BlockmtForm" element={<BlockmtForm />} />
      <Route path="/Schedule" element={<Schedule />} />
      <Route path="/DispatchList" element={<DispatchList />} />
      <Route path="/Raw_material_update/" element={<Raw_material_update />} />
      <Route path="/Issu/" element={<Issu />} />
      <Route path="/Issu_list/" element={<Issu_list />} />
      <Route path="/Single/" element={<Single />} />
      <Route path="/Planning_updates/" element={<Planning_updates />} />
      <Route path="/Rating/" element={<Rating />} />
      <Route path="/ScheduleForm/" element={<ScheduleForm />} />
      <Route path="/TraceabilityCard/" element={<TraceabilityCard />} />
      <Route path="/TraceabilityCard2/" element={<TraceabilityCard2 />} />
      <Route path="/ForgingList/" element={<ForgingList />} />
      <Route path="/BulkAddForm/" element={<BulkAddForm />} />
      <Route path="/ForgingAnalyticsPage/" element={<ForgingAnalyticsPage />} />
      <Route path="/Forging_home/" element={<Forging_home />} />
      <Route path="/Pre_mc_production1/" element={<Pre_mc_production1 />} />
      <Route path="/Pre_mc_home/" element={<Pre_mc_home />} />
      <Route path="/Pre_mclist/" element={<Pre_mclist />} />
      <Route path="/Pre_mc_form/" element={<Pre_mc_form />} />
      <Route path="/Heattreatment_home/" element={<Heattreatment_home />} />
      <Route path="/Htanalytics1/" element={<Htanalytics1 />} />
      <Route path="/Ht_list/" element={<Ht_list />} />
      <Route path="/BulkAddFormheattreatment/" element={<BulkAddFormheattreatment />} />
      <Route path="/Shot_blast_production1/" element={<Shot_blast_production1 />} />
      <Route path="/Shot_blast_home/" element={<Shot_blast_home />} />
      <Route path="/Shot_blastlist/" element={<Shot_blastlist />} />
      <Route path="/Shot_blast_form/" element={<Shot_blast_form />} />

      <Route path="/Cnc_home/" element={<Cnc_home />} />
      <Route path="/Cnc_production1/" element={<Cnc_production1 />} />
      <Route path="/Cnc_list/" element={<Cnc_list />} />
      <Route path="/BulkAddFormcnc/" element={<BulkAddFormcnc />} />
      <Route path="/CncPlanningForm/" element={<CncPlanningForm />} />
      <Route path="/CncPlanningList/" element={<CncPlanningList />} />
      

      <Route path="/Fi_home/" element={<Fi_home />} />
      <Route path="/Fi_production1/" element={<Fi_production1 />} />
      <Route path="/Fi_list/" element={<Fi_list />} />
      <Route path="/BulkAddFormfi/" element={<BulkAddFormfi />} />

      <Route path="/Marking_home/" element={<Marking_home />} />
      <Route path="/Marking_production1/" element={<Marking_production1 />} />
      <Route path="/Marking_list/" element={<Marking_list />} />
      <Route path="/Marking_form/" element={<Marking_form />} />

      <Route path="/Visual_home/" element={<Visual_home />} />
      <Route path="/Visual_production1/" element={<Visual_production1 />} />
      <Route path="/Visual_list/" element={<Visual_list />} />
      <Route path="/BulkAddFormvisual/" element={<BulkAddFormvisual />} />

      <Route path="/DispatchForm/" element={<DispatchForm />} />
      <Route path="/DispatchList1/" element={<DispatchList1 />} />

      <Route path="/Master_list_list/" element={<Master_list_list />} />
      
      <Route path="/BlockmtForm_dummy/" element={<BlockmtForm_dummy />} />
      <Route path="/Master_list_listqa/" element={<Master_list_listqa />} />
      <Route path="/Master_list_list1/" element={<Master_list_list1 />} />
      <Route path="/Master_list_list2/" element={<Master_list_list2 />} />
      <Route path="/Master_list_list3/" element={<Master_list_list3 />} />
      <Route path="/PlanningUpdates1/" element={<PlanningUpdates1 />} />
      <Route path="/Cnc_planning/" element={<Cnc_planning />} />
      <Route path="/Forgingrejection/" element={<Forgingrejection />} />

      <Route path="/BatchTrackingTable1/" element={<BatchTrackingTable1 />} />
      <Route path="/BatchTrackingTable2/" element={<BatchTrackingTable2 />} />
      <Route path="/BatchTrackingTable3/" element={<BatchTrackingTable3 />} />
      <Route path="/BatchTrackingTable4/" element={<BatchTrackingTable4 />} />
      <Route path="/BatchTrackingTable5/" element={<BatchTrackingTable5 />} />
      <Route path="/BatchTrackingTable6/" element={<BatchTrackingTable6 />} />
      <Route path="/BatchTrackingTable7/" element={<BatchTrackingTable7 />} />
      <Route path="/BatchTrackingTable8/" element={<BatchTrackingTable8 />} />
      <Route path="/BatchTrackingTable9/" element={<BatchTrackingTable9 />} />
      <Route path="/ChangePassword/" element={<ChangePassword />} />
      <Route path="/Signup/" element={<Signup />} />

      <Route path="/CustomerComplaint/" element={<CustomerComplaint />} />
      <Route path="/CustomerComplaint1/" element={<CustomerComplaint1 />} />
      <Route path="/LineMaster/" element={<LineMaster />} />
      <Route path="/Calibration/" element={<Calibration />} />
      <Route path="/Calibrationqa/" element={<Calibrationqa />} />
      <Route path="/CalibrationRejected/" element={<CalibrationRejected />} />
      <Route path="/Pdfextrection/" element={<Pdfextrection />} />
      <Route path="/UIDGenerator/" element={<UIDGenerator />} />
      <Route path="/Ratingmain/" element={<Ratingmain />} />
      <Route path="/InventoryStatus/" element={<InventoryStatus />} />
      <Route path="/Rm_schedule/" element={<Rm_schedule />} />
    </Routes>
  );
};

export default App;
