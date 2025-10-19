package main

import (
	"fmt"
	"oil-gas-service-booking/internal/config"
)

func main() {

	// примерный план

	// TODO init config (yaml нврн)
	cfg := config.MustLoad()
	fmt.Println(cfg)

	// TODO init logger: slog

	// TODO init storage: сначала sqlite потом перейду на postgresql

	// TODO init router (вроде надо)

	// TODO run server
}
