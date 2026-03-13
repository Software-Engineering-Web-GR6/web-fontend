import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useThresholds } from "../../hooks";
import { Thermometer, Droplets, RotateCcw, Save } from "lucide-react";

const Settings: React.FC = () => {
  const { thresholds, loading, updateThresholds, reset } = useThresholds();
  const [localThresholds, setLocalThresholds] = useState(thresholds);
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    setLocalThresholds(thresholds);
  }, [thresholds]);

  const handleChange = (field: string, value: number) => {
    setLocalThresholds((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      await updateThresholds(localThresholds);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save thresholds:", error);
    }
  };

  const handleReset = async () => {
    try {
      await reset();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to reset thresholds:", error);
    }
  };

  return (
    <Layout title="Cài đặt" subtitle="Cấu hình ngưỡng cảnh báo" isAdmin={true}>
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Cấu hình ngưỡng cảnh báo</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Temperature Thresholds */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Thermometer className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Ngưỡng nhiệt độ
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhiệt độ tối thiểu (°C)
                  </label>
                  <input
                    type="number"
                    value={localThresholds.tempMin}
                    onChange={(e) =>
                      handleChange("tempMin", Number(e.target.value))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhiệt độ tối đa (°C)
                  </label>
                  <input
                    type="number"
                    value={localThresholds.tempMax}
                    onChange={(e) =>
                      handleChange("tempMax", Number(e.target.value))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Nhiệt độ bình thường: {localThresholds.tempMin}°C -{" "}
                {localThresholds.tempMax}°C
              </p>
            </div>

            {/* Humidity Thresholds */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Droplets className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Ngưỡng độ ẩm
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Độ ẩm tối thiểu (%)
                  </label>
                  <input
                    type="number"
                    value={localThresholds.humidityMin}
                    onChange={(e) =>
                      handleChange("humidityMin", Number(e.target.value))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Độ ẩm tối đa (%)
                  </label>
                  <input
                    type="number"
                    value={localThresholds.humidityMax}
                    onChange={(e) =>
                      handleChange("humidityMax", Number(e.target.value))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Độ ẩm bình thường: {localThresholds.humidityMin}% -{" "}
                {localThresholds.humidityMax}%
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <Button variant="ghost" onClick={handleReset} disabled={loading}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Khôi phục mặc định
              </Button>
              <Button onClick={handleSave} loading={loading}>
                <Save className="w-4 h-4 mr-2" />
                {saved ? "Đã lưu!" : "Lưu thay đổi"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
