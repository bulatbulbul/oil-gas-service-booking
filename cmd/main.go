package main

import (
	"fmt"
	_ "modernc.org/sqlite" // драйвер без CGO
	"oil-gas-service-booking/internal/config"
)

func main() {

	// мб фреймворком нужно подумать каким

	// примерный план
	// TODO init config (yaml нврн)
	cfg := config.MustLoad()
	fmt.Println(cfg)

	// TODO init logger: slog  (мб не надо)

	// TODO init storage: сначала sqlite потом перейду на postgresql

	// TODO init router (вроде надо)

	// TODO run server
}
