module MetricsHelper
  # gross_ecpc, gross_ecpa  (which are gross_rev / clicks and gross_rev / (total_post_click + total_post_imp) respectively..)
  def actual_kpi_value kpi_type, metrics
    case kpi_type
      when Order::KpiTypes::IMPRESSIONS, Order::KpiTypes::CLICKS, Order::KpiTypes::CTR
        metrics[kpi_type.downcase].to_i
      when Order::KpiTypes::ACTIONS
        metrics["post_click"] + metrics["post_imp"]
      when Order::KpiTypes::CPM, Order::KpiTypes::CPC, Order::KpiTypes::CPA
        # metrics["gross_rev"] / metrics["impressions"]
        # metrics["gross_rev"] / metrics["clicks"]
        # metrics["gross_rev"] / (metrics["post_click"] + metrics["post_imp"])
        metrics["gross_e#{kpi_type.downcase}"]
    end
  end

  def cdb_kpi_fields kpi_type
    case kpi_type
      when Order::KpiTypes::IMPRESSIONS, Order::KpiTypes::CLICKS, Order::KpiTypes::CTR
        #already included in cdb fields
        ""
      when Order::KpiTypes::ACTIONS
        "post_click,post_imp"
      when Order::KpiTypes::CPM, Order::KpiTypes::CPC, Order::KpiTypes::CPA
        "gross_e#{kpi_type.downcase}"
    end
  end

  def track_kpi_value_progress kpi_type, metrics
    case kpi_type
      when Order::KpiTypes::IMPRESSIONS, Order::KpiTypes::CLICKS, Order::KpiTypes::ACTIONS
        metrics["kpi_value"] < metrics["actual_kpi_value"] ? "right-pacing" : "underrate"
      when Order::KpiTypes::CPM, Order::KpiTypes::CPC, Order::KpiTypes::CPA
        metrics["kpi_value"] < metrics["actual_kpi_value"] ? "underrate" : "right-pacing"
      when Order::KpiTypes::CTR
        metrics["kpi_value"] < metrics["actual_kpi_value"] ? "right-pacing" : "underrate"
    end
  end

  def kpi_value_display(kpi_type, kpi_value)
    case kpi_type
      when Order::KpiTypes::IMPRESSIONS, Order::KpiTypes::CLICKS, Order::KpiTypes::ACTIONS
        kpi_value.to_i
      when Order::KpiTypes::CPM, Order::KpiTypes::CPC, Order::KpiTypes::CPA
        "$#{kpi_value}"
      when Order::KpiTypes::CTR
        "#{kpi_value}%"
    end
  end
end