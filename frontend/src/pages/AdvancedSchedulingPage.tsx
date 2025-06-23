import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import NavigationHeader from "../components/NavigationHeader";
import RecurringPatternsTab from "../components/advanced-scheduling/RecurringPatternsTab";
import PlayerAvailabilityTab from "../components/advanced-scheduling/PlayerAvailabilityTab";
import SmartSchedulingTab from "../components/advanced-scheduling/SmartSchedulingTab";
import TeamAvailabilityTab from "../components/advanced-scheduling/TeamAvailabilityTab";

interface TabPanelProps {
  children?: any;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`advanced-scheduling-tabpanel-${index}`}
      aria-labelledby={`advanced-scheduling-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `advanced-scheduling-tab-${index}`,
    "aria-controls": `advanced-scheduling-tabpanel-${index}`,
  };
}

const AdvancedSchedulingPage = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTabChange = (event: any, newValue: number) => {
    setTabValue(newValue);
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Please log in to access Advanced Scheduling.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <NavigationHeader
        title="Advanced Game Scheduling"
        subtitle="Manage recurring game patterns, player availability, and smart scheduling features."
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="advanced scheduling tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Recurring Patterns" {...a11yProps(0)} />
            <Tab label="Player Availability" {...a11yProps(1)} />
            <Tab label="Smart Scheduling" {...a11yProps(2)} />
            <Tab label="Team Availability" {...a11yProps(3)} />
          </Tabs>
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        )}

        <TabPanel value={tabValue} index={0}>
          <RecurringPatternsTab onError={setError} onLoading={setLoading} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <PlayerAvailabilityTab onError={setError} onLoading={setLoading} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <SmartSchedulingTab onError={setError} onLoading={setLoading} />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <TeamAvailabilityTab onError={setError} onLoading={setLoading} />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AdvancedSchedulingPage;
