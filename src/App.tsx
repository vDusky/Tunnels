import { DefaultPluginUISpec, PluginUISpec } from "molstar/lib/mol-plugin-ui/spec";
import { Plugin } from "molstar/lib/mol-plugin-ui/plugin";
import { SbNcbrPartialCharges } from "molstar/lib/extensions/sb-ncbr";
import { PluginSpec } from "molstar/lib/mol-plugin/spec";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import { runVisualizeTunnel, runVisualizeTunnels } from "./examples";
import { Download, ParseCif } from "molstar/lib/mol-plugin-state/transforms/data";
import { TrajectoryFromMmCif, ModelFromTrajectory, StructureFromModel, StructureComponent } from "molstar/lib/mol-plugin-state/transforms/model";
import { StructureRepresentation3D } from "molstar/lib/mol-plugin-state/transforms/representation";

const MySpec: PluginUISpec = {
  ...DefaultPluginUISpec(),
  layout: {
    initial: {
      isExpanded: true,
      showControls: true,
      regionState: {
        bottom: "full",
        left: "full",
        right: "full",
        top: "full",
      },
    },
  },
  behaviors: [
    PluginSpec.Behavior(SbNcbrPartialCharges),
    ...DefaultPluginUISpec().behaviors,
  ],
};

async function load(plugin: PluginUIContext, url: string) {
  const update = plugin.build();
  const structure = await update.toRoot()
        .apply(Download, { url, isBinary: true })
        .apply(ParseCif)
        .apply(TrajectoryFromMmCif)
        .apply(ModelFromTrajectory)
        .apply(StructureFromModel);
  const polymer = structure.apply(StructureComponent, { type: { name: 'static', params: 'polymer' } });
  polymer.apply(StructureRepresentation3D, {
      type: { name: 'cartoon', params: { alpha: 1 } },
      colorTheme: { name: 'chain-id', params: {} },
  });
  await update.commit();
}

export function App() {
  const plugin = new PluginUIContext(MySpec);
  plugin.init();
  
  runVisualizeTunnels(plugin);
  load(plugin, 'https://models.rcsb.org/3tbg.bcif')

  // runVisualizeTunnel(plugin);

  return <Plugin plugin={plugin} />;
}
