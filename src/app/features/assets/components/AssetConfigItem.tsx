'use client';

import { memo } from "react";
import { Label } from "@/app/components/UI/Label";
import { Switch } from "@/app/components/UI/Switch";
import { ExternalLinkIcon } from "lucide-react";
import { AssetTabConfig } from "../AssetsFeature";

const ModelSwitch = memo(({
    model,
    isEnabled,
    onToggle,
    referenceUrl
}: {
    model: string;
    isEnabled: boolean;
    onToggle: () => void
    referenceUrl?: string;
}) => (
    <div className="flex items-center gap-2">
        <Switch
            id={`${model}-mode`}
            checked={isEnabled}
            onCheckedChange={onToggle}
            className="data-[state=checked]:bg-sky-600"
        />
        <Label
            className={`${isEnabled ? 'text-white' : 'text-gray-400'}`}
            htmlFor={`${model}-mode`}
        >
            {model.charAt(0).toUpperCase() + model.slice(1)}
        </Label>
        {isEnabled && <span>
            <a href={`${referenceUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sky-100/50 hover:text-sky-100/90 transition-colors duration-200`}>
                <ExternalLinkIcon size={14} />
            </a>
        </span>}
    </div>
));

ModelSwitch.displayName = "ModelSwitch";

type ConfigItemProps = {
    model: keyof AssetTabConfig;
    config: AssetTabConfig;
    onUpdateConfig: (model: keyof AssetTabConfig, enabled: boolean, apiKey: string) => void;
    tooltip: string;
}

const AssetConfigItem = ({ model, config, onUpdateConfig, tooltip }: ConfigItemProps) => {
    const isEnabled = config[model].enabled;
    const savedApiKey = config[model].apiKey;
    const handleToggleModel = () => {
        onUpdateConfig(model, !isEnabled, savedApiKey);
    };

    return (
        <div className="flex flex-col gap-2">
            <div
                className="flex items-center justify-between"
                title={tooltip}
            >
                <ModelSwitch
                    model={model}
                    isEnabled={isEnabled}
                    onToggle={handleToggleModel}
                    referenceUrl={config[model].reference_url}
                />
            </div>
        </div>
    );
};

export default AssetConfigItem;

