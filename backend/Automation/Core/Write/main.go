package main
import (
	"github.com/go-vgo/robotgo"
	"os"
)

func main(){
	texto := os.Args[1]
	robotgo.Type(texto)
}