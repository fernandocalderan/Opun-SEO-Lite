import type { Meta, StoryObj } from "@storybook/react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ThemeProvider } from "next-themes";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  keyInsights,
  kpiSummary,
  overviewNarrative,
  reputationAlerts,
} from "@/lib/mocks";
import { formatRelativeTimeFromNow } from "@/lib/utils/relativeTime";
import type { OverviewDataset } from "@/lib/gateways";
import type { InsightItem, KpiSummaryItem } from "@/lib/mocks/types";
import { overviewQueryKey } from "@/modules/overview/hooks";
import { OverviewScreen } from "@/modules/overview/OverviewScreen";

type InsightSeverityPreset = "balanced" | "allCritical" | "lowFocus";

type OverviewStoryArgs = {
  alertCount: number;
  insightSeverityPreset: InsightSeverityPreset;
  includeKpis: boolean;
};

const meta: Meta<typeof OverviewStoryShell> = {
  title: "Pages/Overview",
  component: OverviewStoryShell,
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
    docs: {
      description: {
        component:
          "Vista Overview conectada al contrato `/v1/overview`. Referencia: `docs/frontend-api-contracts.openapi.yaml`.",
      },
    },
  },
  argTypes: {
    alertCount: {
      control: { type: "range", min: 0, max: 6, step: 1 },
      description:
        "Cantidad de alertas mock a mostrar (0 activa el estado vacio).",
    },
    insightSeverityPreset: {
      control: {
        type: "select",
        options: ["balanced", "allCritical", "lowFocus"],
      },
      description:
        "Ajusta la severidad de las recomendaciones para validar estilos y prioridades.",
    },
    includeKpis: {
      control: { type: "boolean" },
      description:
        "Desactiva para validar el estado vacio de KPIs configurables.",
    },
  },
  args: {
    alertCount: 3,
    insightSeverityPreset: "balanced",
    includeKpis: true,
  },
};

export default meta;

type Story = StoryObj<typeof OverviewStoryShell>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Estado base con dataset mock. Ajusta controles para revisar vacios/severidad y validar copy con stakeholders.",
      },
    },
  },
};

export const EmptyStates: Story = {
  args: {
    alertCount: 0,
    includeKpis: false,
    insightSeverityPreset: "lowFocus",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Escenario sin datos donde se activan los estados vacios de KPIs, alertas e Insights.",
      },
    },
  },
};

export const HighRiskSpike: Story = {
  args: {
    alertCount: 5,
    insightSeverityPreset: "allCritical",
    includeKpis: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Escenario de riesgo reputacional donde todos los insights suben a severidad critica y hay alto volumen de alertas.",
      },
    },
  },
};

function OverviewStoryShell({
  alertCount,
  insightSeverityPreset,
  includeKpis,
}: OverviewStoryArgs) {
  const dataset = useMemo<OverviewDataset>(() => {
    const alerts = buildAlerts(alertCount);
    const insights = buildInsights(insightSeverityPreset);
    const kpis = includeKpis ? buildKpis() : [];

    return {
      kpis,
      alerts,
      insights,
      narrative: overviewNarrative,
    };
  }, [alertCount, includeKpis, insightSeverityPreset]);

  return <OverviewStoryProviders dataset={dataset} />;
}

function OverviewStoryProviders({ dataset }: { dataset: OverviewDataset }) {
  const datasetRef = useRef(dataset);
  const [queryClient] = useState(() => {
    const client = new QueryClient();
    client.setQueryData(overviewQueryKey, datasetRef.current);
    return client;
  });

  useEffect(() => {
    datasetRef.current = dataset;
    queryClient.setQueryData(overviewQueryKey, dataset);
  }, [dataset, queryClient]);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <OverviewScreen />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function buildAlerts(target: number): OverviewDataset["alerts"] {
  if (target <= 0) {
    return [];
  }

  return Array.from({ length: target }).map((_, index) => {
    const template = reputationAlerts[index % reputationAlerts.length];
    const baseIso = template.publishedAtIso ?? template.publishedAt;
    const adjustedIso =
      index === 0
        ? new Date(Date.now() - 2 * 60 * 1000).toISOString()
        : baseIso;

    return {
      ...template,
      id: `${template.id}-${index + 1}`,
      publishedAt: formatRelativeTimeFromNow(adjustedIso),
      publishedAtIso: adjustedIso,
    };
  });
}

function buildInsights(preset: InsightSeverityPreset): OverviewDataset["insights"] {
  const severityMap: Record<InsightSeverityPreset, InsightItem["severity"][]> = {
    balanced: ["critical", "medium", "low", "high"],
    allCritical: ["critical", "critical", "high", "critical"],
    lowFocus: ["low", "medium", "low", "low"],
  };

  const chosenSeverities = severityMap[preset];

  return keyInsights.map((insight, index) => ({
    ...insight,
    severity: chosenSeverities[index] ?? insight.severity,
  }));
}

function buildKpis(): KpiSummaryItem[] {
  return kpiSummary;
}
