class HomeController < ApplicationController
  def index
  end

  def about
  end

  def defaults
    render json: {
      '2012' => { # current year
        'population' => 7_511_690,
        'groundwater_level' => 130_000_000_000,
        'water_consumption_per_year' => 4_000_000_000,
        'groundwater_consumption_per_year' => 3_240_000_000
      }
    }
  end
end
